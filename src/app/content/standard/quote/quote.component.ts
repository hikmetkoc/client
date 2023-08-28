import {
	Component,
	OnInit,
	ChangeDetectionStrategy,
	ViewChild,
	AfterViewInit,
	ViewEncapsulation,
	Input
} from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { BaseDataSource } from '../../_base/base.datasource';
import { LineItemsComponent } from '../../_base/lineitems/lineitems.component';
import { ActivatedRoute, Router } from '@angular/router';

import { Filter } from '../../_base/models/filter';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DeleteEntityDialogComponent } from '../../_base/dialogs/delete-entity-dialog/delete-entity-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { V } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import {ReportDialogComponent} from "../../_base/dialogs/report-dialog/report-dialog.component";
import {catchError, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {HttpUtilsService} from "../../_base/http-utils.service";
import {FileManagerToolComponent} from "../../_base/detail/filemanager/filemanagertool/filemanagertool.component";
import {
	FileManagerDialogComponent
} from "../../_base/detail/filemanager/file-manager-dialog/file-manager-dialog.component";

@Component({
	selector: 'kt-quote',
	templateUrl: './quote.component.html',
	styleUrls: ['./quote.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.Default
})
export class QuoteComponent extends BaseComponent implements OnInit, AfterViewInit {

	@ViewChild(LineItemsComponent, undefined) lineItems;
	@Input() current: any;
	@Input() model: any;
	@ViewChild(FileManagerToolComponent, undefined) fileManagerTool;
	files: any;
	dataSource: BaseDataSource;
	defaultFilter = [];
	defaultValues = [];
	currentQuoteVersion: any;
	modelQuoteVersion: any;
	documents = [];
	description: string;
	loading$: Observable<boolean>;
	inputFiles = [];
	utils = Utils;
	dosyasec: string;

	constructor(
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public router: Router,
		public route: ActivatedRoute,
		public breakpointObserver: BreakpointObserver,
		public modalService: NgbModal,
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('Quote');
		this.modelQuoteVersion = Utils.getModel('QuoteVersion');
		this.loading$ = this.baseService.loadingSubject.asObservable();
	}

	ngOnInit() {
		this.init();
	}

	ngAfterViewInit() {
		this.afterViewInit();
		this.evaluateButtons();

	}
	evaluateButtons() {
		this.buttons = [];

		this.buttons.push( {
			display: this.baseService.getPermissionRule('user', 'update'),
			title: 'Standart Rapor İndir',
			icon: 'cloud_download',
			click: this.rapordownload.bind(this)
		}, {
			display: this.baseService.getPermissionRule(this.model.name, 'update'),
			title: 'Yeni Rapor',
			icon: 'add_box',
			click: this.mainGrid.add.bind(this.mainGrid)
		});
	}

	rowClicked(row, reload?) {
		if (reload) {
			this.reloadCurrent(row.id);
		} else {
			this.defaultFilter = [{
				name: 'quote.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultValues = [{
				field: 'quoteId',
				value: row.id
			}, {
				field: 'quote',
				value: row
			}];
			this.current = row;
		}
	}

	quoteVersionRowClicked(row: any) {
		this.currentQuoteVersion = row;
	}
	resetCurrentQuoteVersion() {
		this.currentQuoteVersion = undefined;
		this.reloadCurrent();
	}

	delete(_item: any, e) {
		if (e) { e.stopPropagation(); }

		const dialogRef = this.deleteElement();
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.baseService.delete(_item.id, this.model.apiName).subscribe(() => {
				Utils.showActionNotification('Silindi', 'success', 10000, true, false, 3000, this.snackBar);
				this.resetCurrent();
			});
		});
	}

	deleteElement() {
		return this.dialog.open(DeleteEntityDialogComponent, {
			data: {},
			width: '440px'
		});
	}

	/*contractRowClicked(row) {
		this.router.navigate(['/contract'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}*/

	showDocumentModal(sendDocumentModal) {
		if (this.documents.length === 0) {
			this.baseService.find(undefined, 'quotes/documents').subscribe((res) => {
				Object.keys(res.body).forEach(controlName => {
					this.documents.push({
						name: controlName,
						title: res.body[controlName]
					});
				});
				this.modalService.open(sendDocumentModal, { size: 'sm' });
			});
		} else {
			this.modalService.open(sendDocumentModal, { size: 'sm' });
		}
	}

	sendDocuments() {
		const docsToSend = [];
		for (let doc of this.documents) {
			if (doc.checked) {
				docsToSend.push(doc.name);
			}
		}
		if (docsToSend.length > 0) {
			this.baseService.loadingSubject.next(true);
			this.baseService.update({ quoteId: this.current.id, docs: docsToSend }, 'quotes/documents').subscribe(() => {
				this.baseService.loadingSubject.next(false);
				Utils.showActionNotification('Gönderildi', 'success', 10000, true, false, 3000, this.snackBar);
				this.modalService.dismissAll();
			});
		}
	}

	getReport() {
		const dialogRef = this.dialog.open(ReportDialogComponent, { data: { filter: 'date', title: 'Yönetici Raporu' } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				if (this.baseService.loadingSubject.value) { return; }
				this.baseService.loadingSubject.next(true);
				res.startDate = Utils.dateFormatForApi(res.startDate);
				res.endDate = Utils.dateFormatForApi(res.endDate);
				const httpHeaders = this.httpUtils.getHTTPHeaders();
				this.http.post('api/' + this.model.apiName + '/report?startDate=' + res.startDate + '&endDate=' + res.endDate, undefined, { headers: httpHeaders, responseType: 'blob' })
					.pipe(
						tap(res2 => {
							Utils.downloadFile(res2, 'Excel', 'Yönetici Raporu');
							this.baseService.loadingSubject.next(false);
						}),
						catchError(err => {
							this.baseService.loadingSubject.next(false);
							return err;
						})
					).subscribe();
			}
		});
	}

	loadList() {
		if (this.model !== undefined) {
			this.baseService.find({}, this.model.apiName + '/file-list?entityId=' + this.current.id).subscribe(res2 => {
				this.files = res2.body;
			});
		} else {
			this.baseService.find({entityName: 'Generic', entityId: 0}, 'File/GetFileList').subscribe(res2 => {
				this.files = res2.body.result;
			});
		}
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
	rapordownload() {
		if (this.baseService.getUserId() === 35) {this.dosyasec = '351ee3d5-edfd-49b0-916c-3ae2a568a643'; }
		if (this.baseService.getUserId() === 83) {this.dosyasec = '996d8e56-2cac-436e-a391-b397d3e89052'; }
		if (this.baseService.getUserId() === 90) {this.dosyasec = '22c0683a-d2e5-4145-ab0c-eb6e2437c7ed'; }
		if (this.baseService.getUserId() === 91) {this.dosyasec = '76f17bba-b63e-43ce-9c47-a2035ea20310'; }
		if (this.baseService.getUserId() === 93) {this.dosyasec = 'de59b4a4-cf33-4a12-b602-6cedd2e39551'; }
		if (this.baseService.getUserId() === 126) {this.dosyasec = '2faa047c-53fb-4e75-97d2-206130084422'; }
		if (this.baseService.getUserId() === 15) {this.dosyasec = '04506cdf-b204-49cf-bffc-0bc5968dd754'; }
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post('api/' + this.model.apiName + '/file-download?fileId=' + this.dosyasec, {}, {headers: httpHeaders, responseType: 'blob', observe: 'response'})
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

	deletefile(row, e) {
		this.baseService.delete(row.id, this.model.apiName + '/file-delete').subscribe(res2 => {
			Utils.showActionNotification('Dosya silindi', 'success', 10000, true, false, 3000, this.snackBar);
			this.loadList();
		});
	}
}
