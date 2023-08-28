import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {HttpUtilsService} from "../../http-utils.service";

@Component({
	selector: 'kt-payment-order-info-dialog',
	templateUrl: 'payment-order-info-dialog.component.html',
})
export class PaymentOrderInfoDialogComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;

	constructor(
		private cdr: ChangeDetectorRef,
		public baseService: BaseService,
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dateAdapter: DateAdapter<Date>,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
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
	}

	formatAmount(amount) {
		// Amount'u yerel para birimi biçimine dönüştür
		return Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
	}
	formatDate(date: string): string {
		if (!date) return '';

		const formattedDate = new Date(date);
		const day = ('0' + formattedDate.getDate()).slice(-2);
		const month = ('0' + (formattedDate.getMonth() + 1)).slice(-2);
		const year = formattedDate.getFullYear();
		const hour = ('0' + formattedDate.getHours()).slice(-2);
		const minute = ('0' + formattedDate.getMinutes()).slice(-2);

		return `${day}-${month}-${year} ${hour}:${minute}`;
	}
}
