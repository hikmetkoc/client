import { Component, ChangeDetectionStrategy, Input, AfterViewInit, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Utils } from '../../../utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseService } from '../../../base.service';
import { MatSnackBar } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { HttpUtilsService } from '../../../http-utils.service';
import { tap, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
	selector: 'kt-filemanagertool',
	templateUrl: './filemanagertool.component.html',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.Default
})
export class FileManagerToolComponent implements AfterViewInit, OnInit {

	@Input() current: any;
	@Input() model: any;
	description: string;
	files: any;
	loading$: Observable<boolean>;
	inputFiles = [];
	utils = Utils;
	fileNumber: number;

	constructor(
		private modalService: NgbModal,
		public baseService: BaseService,
		private snackBar: MatSnackBar,
		private http: HttpClient,
		private httpUtils: HttpUtilsService
	) {
		this.loading$ = this.baseService.loadingSubject.asObservable();
	}

	ngOnInit() {
		this.fileNumber = 0;
		this.loadList();
	}

	ngAfterViewInit() {

	}

	loadList() {
		if (this.model !== undefined) {
			this.baseService.find({}, this.model.apiName + '/file-list?entityId=' + this.current.id).subscribe(res2 => {
				this.files = res2.body;
				this.fileNumber++;
			});
		} else {
			this.baseService.find({entityName: 'Generic', entityId: 0}, 'File/GetFileList').subscribe(res2 => {
				this.files = res2.body.result;
				this.fileNumber++;
			});
		}
		console.log(this.fileNumber);
	}

	prepareUpload(e) {
		this.inputFiles = e.target.files;
	}

	upload() {
		if (this.inputFiles.length === 0) { return; }
		let httpHeaders = this.httpUtils.getHTTPHeaders();
		httpHeaders = httpHeaders.delete('Content-Type');

		let formData = new FormData();
		formData.append('file', this.inputFiles[0]);
		formData.append('entityId', this.current.id);
		formData.append('description', this.description);

		this.http.put('/api/' + this.model.apiName + '/file-upload', formData, {headers: httpHeaders}).subscribe((val) => {
			this.description = undefined;
			this.inputFiles = [];
			Utils.showActionNotification('Başarı ile Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
			this.loadList();
		});
	}

	download(row, e) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post('api/' + this.model.apiName + '/file-download?fileId=' + row.id, {}, {headers: httpHeaders, responseType: 'blob', observe: 'response'})
			.pipe(
				tap(res => {
					let filename = '';
					const disposition = res.headers.get('Content-Disposition');
					if (disposition && disposition.indexOf('attachment') !== -1) {
						const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
						const matches = filenameRegex.exec(disposition);
						if (matches != null && matches[1]) {
							filename = matches[1].replace(/['"]/g, '');
						}
					}

					Utils.downloadFile(res.body, undefined, filename);
				}),
				catchError(err => {
					return err;
				})
			).subscribe();
	}

	delete(row, e) {
		this.baseService.delete(row.id, this.model.apiName + '/file-delete').subscribe(res2 => {
			Utils.showActionNotification('Dosya silindi', 'success', 10000, true, false, 3000, this.snackBar);
			this.loadList();
		});
	}
}
