import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";
import {catchError, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {HttpUtilsService} from "../../http-utils.service";

@Component({
	selector: 'kt-send-sms-dialog',
	templateUrl: 'send-sms-dialog.component.html',
})
export class SendSmsDialogComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	userList = [];
	selectedStoreId: any;
	onayla: boolean;

	constructor(
		private cdr: ChangeDetectorRef,
		public baseService: BaseService,
		public dialogRef: MatDialogRef<any>,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
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

	onNoClick() {
		this.dialogRef.close();
	}

	onYesClick() {
		this.onayla = true;
		const text = 'DENEME';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `http://www.postaguvercini.com/api_http/sendsms.asp?user=meteorpetrol&password=meteorpetrol1&gsm=${this.selectedStoreId}&text=${text}`;
		this.http.get(url, {headers: httpHeaders})
			.subscribe(
				(res => {
					console.log(res);
					this.dialogRef.close();
				}),
				catchError(err => {
					return err;
				}));
	}

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.getValues();
		this.onayla = false;
	}
	getValues() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'firstName', sortOrder: 'ASC' }],
			0,
			1000
		);
		this.baseService.find(queryParams, 'users').subscribe(res => {
			this.userList = res.body.filter(hld => hld.activated !== false);
			this.cdr.markForCheck();
		});
	}

}
