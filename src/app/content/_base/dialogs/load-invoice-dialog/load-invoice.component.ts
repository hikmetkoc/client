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
	dbList = [];
	selectedDbName;
	clickedButton = false;

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
		// this.runInvoiceService();
		this.getDbNames();
	}

	runInvoiceService() {
		this.clickedButton = true;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post('api/' + this.model.apiName + '/soapservice?dbSirket=' + this.selectedDbName, {}, {headers: httpHeaders, responseType: 'blob', observe: 'response'}).subscribe(
			res => {
				if (res) {
					Utils.showActionNotification('Faturalar başarıyla yüklendi.', 'success', 10000, true, false, 3000, this.snackBar);
					this.clickedButton = false;
				}
			},
			err => {
				console.error(err);
				Utils.showActionNotification('Faturalar yüklenirken hata oluştu.', 'error', 10000, true, false, 3000, this.snackBar);
			}
		);
	}

	getDbNames() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'weight', sortOrder: 'ASC' }],
			0,
			10000
		);
		this.baseService.find(queryParams, 'attribute-values').subscribe(res => {
			this.dbList = res.body.filter(hld => hld.attribute.id === 'SapDbNames');
			this.cdr.markForCheck();
		});
	}
	onNoClick() {
		this.dialogRef.close();
	}
}
