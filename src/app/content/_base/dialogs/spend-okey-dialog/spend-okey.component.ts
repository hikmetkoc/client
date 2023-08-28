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
	selector: 'kt-spend-okey',
	templateUrl: 'spend-okey.component.html',
})
export class SpendOkeyComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	@Input() durum: any;
	description: any;
	onayla: boolean;

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
			this.durum = data.durum;
		}
		if (data && data.current && data.durum) {
			this.current = data.current;
			this.durum = data.durum;
		}
	}
	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.durum = this.data.durum;
		if (this.durum === 'Spend_Status_Red') {
			this.onayla = false;
		} else {
			this.runInvoiceService();
		}
	}

	onNoClick() {
		this.dialogRef.close();
	}

	runInvoiceService() {
		this.onayla = true;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = this.current;
		const status = this.durum;
		const url = `api/spends/${id}?status=${status}&description=${this.description}`;
		// PUT isteği gönderme
		this.http.put(url, null, { headers: httpHeaders})
			.subscribe(
				() => {
					this.dialogRef.close();
				},
				(error) => {
					console.error('Hata:', error);
					Utils.showActionNotification('İşlem yapılırken bir hata oluştu.', 'error', 10000, true, false, 3000, this.snackBar);
				}
			);
	}
}
