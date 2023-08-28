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
	selector: 'kt-payment-okey',
	templateUrl: 'payment-okey.component.html',
})
export class PaymentOkeyComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	@Input() paymentStatus: any;
	@Input() spendStatus: any;
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
			this.paymentStatus = data.paymentStatus;
			this.spendStatus = data.spendStatus;
		}
		if (data && data.current && data.paymentStatus) {
			this.current = data.current;
			this.paymentStatus = data.paymentStatus;
			this.spendStatus = data.spendStatus;
		}
	}
	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.paymentStatus = this.data.paymentStatus;
		this.spendStatus = this.data.spendStatus;
		if (this.paymentStatus === 'Payment_Status_Red') {
			this.onayla = false;
		} else {
			this.onYesClick();
		}
	}

	onNoClick() {
		this.dialogRef.close();
	}

	onYesClick() {
		this.onayla = true;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = this.current.id;
		const status = this.paymentStatus;
		const spendstatus = this.spendStatus;
		const description = this.current.description;
		const url = `api/payment_orders/${id}?status=${status}&description=${description}`;
		// PUT isteği gönderme
		this.http.put(url, null, { headers: httpHeaders})
			.subscribe(
				() => {
					console.log('Ödeme siparişi paymentStatusu güncellendi.');
					this.dialogRef.close();
				},
				(error) => {
					console.error('Hata:', error);
				}
			);
		// SPEND -> PAYMENTSTATUS güncelle

		const spendurl = `api/spends/updatepaymentstatus/${id}?status=${spendstatus}`;
		// PUT isteği gönderme
		this.http.put(spendurl, null, { headers: httpHeaders})
			.subscribe(
				() => {
					console.log('Ödeme siparişi paymentStatusu güncellendi.');
				},
				(error) => {
					console.error('Hata:', error);
				}
			);
	}
}
