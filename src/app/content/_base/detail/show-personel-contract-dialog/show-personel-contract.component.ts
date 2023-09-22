import {ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from '../../models/query-params.model';
import {Utils} from '../../utils';
import {BaseService} from '../../base.service';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {HttpUtilsService} from '../../http-utils.service';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
	selector: 'kt-resign',
	templateUrl: 'show-personel-contract.component.html',
})
export class ShowPersonelContractComponent implements OnInit {
	@Input() current: any;
	@Input() model: any;
	resignList = [];

	constructor(
		private cdr: ChangeDetectorRef,
		private elRef: ElementRef,
		public baseService: BaseService,
		public dialogRef: MatDialogRef<any>,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public snackBar: MatSnackBar,
		private dateAdapter: DateAdapter<Date>
	) {
		if (data && data.model) {
			this.model = data.model;
		}
		if (data && data.current) {
			this.current = data.current;
		}
	}

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		//this.getResign();
	}

	onNoClick() {
		this.dialogRef.close();
	}

	formatDate(date: string): string {
		if (!date) {
			return '';
		}
		const formattedDate = new Date(date);
		const day = ('0' + formattedDate.getDate()).slice(-2);
		const month = ('0' + (formattedDate.getMonth() + 1)).slice(-2);
		const year = formattedDate.getFullYear();
		const hour = ('0' + formattedDate.getHours()).slice(-2);
		const minute = ('0' + formattedDate.getMinutes()).slice(-2);
		return `${day}-${month}-${year}`;
	}

	getResign() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{sortBy: 'createdDate', sortOrder: 'DESC'}],
			0,
			1000
		);
		this.baseService.find(queryParams, 'resigns').subscribe(res => {
			this.resignList = res.body.filter(flt => flt.owner.id === this.current.id);
			this.cdr.markForCheck();
		});
	}

	print(adsoyad: string) {
		const apiUrl = `api/personal_contracts/download-degistirilmis-belge?adsoyad=${this.current}`;
		const httpHeaders = this.httpUtils.getHTTPHeaders();

		this.http.get(apiUrl, {
			headers: httpHeaders,
			responseType: 'blob' as 'json', // Blob türünü kullan
		}).subscribe(
			(blob: Blob) => {
				const fileUrl = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href = fileUrl;

				// Dosya adını belirlemek için response headers'ından alabilirsiniz
				const contentDispositionHeader = blob.type;
				const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDispositionHeader);
				const fileName = matches != null && matches[1] ? matches[1].replace(/['"]/g, '') : 'document.docx';

				a.download = fileName;

				document.body.appendChild(a);
				a.click();

				// Temizlik
				window.URL.revokeObjectURL(fileUrl);
				document.body.removeChild(a);
			},
			error => {
				Utils.showActionNotification('Dosya bulunamadı!', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		);
	}

}
