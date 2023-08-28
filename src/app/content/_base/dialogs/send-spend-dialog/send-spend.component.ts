import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";
import {catchError, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {HttpUtilsService} from "../../http-utils.service";

@Component({
	selector: 'kt-send-invoice',
	templateUrl: 'send-spend.component.html',
})
export class SendSpendComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	typeList = [];
	quafList = [];
	selectedTypeId: any;
	selectedQuafId: any;
	selectedDescId: any;

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
		/*this.current.owner = this.selectedUserId;
		this.current.invoiceStatus = this.baseService.getAttrVal('Fatura_Durumlari_Atandi');
		this.baseService.update(this.current, 'invoice_lists').subscribe(() => {
			this.dialogRef.close();
		});*/

		this.baseService.loadingSubject.next(false);
		if (this.baseService.loadingSubject.value) { return; }
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const type = this.selectedTypeId;
		const qualification = this.selectedQuafId;
		const description = this.selectedDescId;
		const url = `api/spends/selectedExcelSpendReport?type=${type}&qualification=${qualification}&description=${description}`;
		const requestData = { ids: this.current };
		console.log('CURRENTS : ' + this.current);
		this.http.post(url, requestData, { headers: httpHeaders, responseType: 'blob' })
			.pipe(
				tap(res => {
					if (res) {
						Utils.downloadFile(res, 'Excel', 'Seçili Ödemeler Raporu');
						this.baseService.loadingSubject.next(true);
						this.dialogRef.close();
					}
				}),
				catchError(err => {
					this.baseService.loadingSubject.next(false);
					return err;
				})
			).subscribe();
	}

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.getAttributeValues();
	}

	formatDate(date: string): string {
		if (!date) return '';

		const formattedDate = new Date(date);
		const day = ('0' + formattedDate.getDate()).slice(-2);
		const month = ('0' + (formattedDate.getMonth() + 1)).slice(-2);
		const year = formattedDate.getFullYear();
		const hour = ('0' + formattedDate.getHours()).slice(-2);
		const minute = ('0' + formattedDate.getMinutes()).slice(-2);

		return `${day}-${month}-${year}`;
	}

	getAttributeValues() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'label', sortOrder: 'ASC' }],
			0,
			10000
		);
		this.baseService.find(queryParams, 'attribute-values').subscribe(res => {
			this.typeList = res.body.filter(hld => hld.attribute.id === 'SpendType_List');
			this.quafList = res.body.filter(hld => hld.attribute.id === 'SpendQuaf_List');
			this.cdr.markForCheck();
		});
	}

}
