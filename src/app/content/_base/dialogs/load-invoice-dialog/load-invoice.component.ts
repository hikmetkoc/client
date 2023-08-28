import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";
import {HttpClient} from "@angular/common/http";
import {HttpUtilsService} from "../../http-utils.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
	selector: 'kt-load-invoice',
	templateUrl: 'load-invoice.component.html',
})
export class LoadInvoiceComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;

	constructor(
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		public dialog: MatDialog,
		public baseService: BaseService,
		public snackBar: MatSnackBar,
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
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
		this.runInvoiceService();
	}

	runInvoiceService() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post('api/' + this.model.apiName + '/soapservice', {}, {headers: httpHeaders, responseType: 'blob', observe: 'response'}).subscribe(
			res => {
				if (res) {
					Utils.showActionNotification('Faturalar başarıyla yüklendi.', 'success', 10000, true, false, 3000, this.snackBar);
					this.dialogRef.close();
				}
			},
			err => {
				console.error(err);
				Utils.showActionNotification('Faturalar yüklenirken hata oluştu.', 'error', 10000, true, false, 3000, this.snackBar);
			}
		);
	}
}
