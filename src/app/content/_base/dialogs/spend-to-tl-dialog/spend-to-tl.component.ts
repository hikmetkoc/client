import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";
import {catchError, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {HttpUtilsService} from "../../http-utils.service";

@Component({
	selector: 'kt-spend-to-tl',
	templateUrl: 'spend-to-tl.component.html',
})
export class SpendToTlComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	money: any;
	isLoading: boolean;

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
		this.baseService.loadingSubject.next(false);
		if (this.baseService.loadingSubject.value) { return; }
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const money = this.money;
		const id = this.current;
		console.log(this.current);
		const url = `api/spends/paytotl/${id}?money=${money}`;

		this.http.put(url, null, { headers: httpHeaders, responseType: 'text' }).subscribe(
			res => {
				this.baseService.loadingSubject.next(true);
				this.isLoading = false;
				this.dialogRef.close();
				//this.cdr.detectChanges();
			}),
			catchError(err => {
				this.baseService.loadingSubject.next(false);
				return err;
			});
	}

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.isLoading = true;
	}
}
