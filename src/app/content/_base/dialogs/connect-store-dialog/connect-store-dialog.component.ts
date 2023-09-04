import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";
import {catchError, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {HttpUtilsService} from "../../http-utils.service";

@Component({
	selector: 'kt-connect-store-dialog',
	templateUrl: 'connect-store-dialog.component.html',
})
export class ConnectStoreDialogComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	storeList = [];
	filteredProducts = [];
	selectedStoreId: any;
	paymentOrderId: any;
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
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		console.log(this.paymentOrderId + '  -  ' + this.selectedStoreId);
		const url = `api/payment_orders/changeStore?id=${this.paymentOrderId}&storeid=${this.selectedStoreId}`;
		console.log(url);
		this.http.put(url, null, { headers: httpHeaders, responseType: 'text' })
			.subscribe(
				(res => {
					this.dialogRef.close();
				}),
				catchError(err => {
					return err;
				}));


		// posta güvercini
		/*const url2 = `http://www.postaguvercini.com/api_http/sendsms.asp?user=meteorpetrol&password=meteorpetrol1&gsm=5442458391&text=DENEME`;
		this.http.get(url2, {headers: httpHeaders})
			.subscribe(
				(res => {
					console.log(res);
					this.dialogRef.close();
				}),
				catchError(err => {
					return err;
				}));*/
	}

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.getStoreValues();
		this.lookPaymentOrderId();
		this.onayla = false;
	}

	lookPaymentOrderId() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
			0,
			500
		);
		filters.add({
			name: 'invoiceNum',
			operator: 'EQUALS',
			value: this.current.invoiceNum
		});
		this.baseService.find(queryParams, 'payment_orders').subscribe(
			res => {

				for (const hld of res.body) {
					if (hld.invoiceNum !== this.current.invoiceNum) {continue; }
					this.paymentOrderId = hld.id;
				}
				this.cdr.markForCheck();

			},
			error => {
			}
		);
	}

	onStoreSelectionChange() {
		// Burada seçilen mağazaya göre verileri güncelleyin.
		// Örnek: Seçilen mağaza ID'sini kullanarak yeni verileri alın veya bir hizmeti çağırın.
		// Güncellenmiş verileri bir değişkende saklayabilirsiniz.
		this.updateTableData();
	}

	updateTableData() {
		// Tablo verilerini güncellemek için bu işlevi kullanabilirsiniz.
		// Güncellenmiş verileri tabloya atayarak tabloyu yenileyebilirsiniz.
		this.filteredProducts = this.storeList.filter(store => store.store.id === this.selectedStoreId);

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
	formatCurrency(amount, decimalCount = 2, decimal = ',', thousands = '.') {
		try {
			decimalCount = Math.abs(decimalCount);
			decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

			const negativeSign = amount < 0 ? '-' : '';

			const i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount), 0).toString();
			const j = (i.length > 3) ? i.length % 3 : 0;

			return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j)
				.replace(/(\d{3})(?=\d)/g, '$1' + thousands) + (decimalCount ? decimal + Math.abs(amount - parseInt(i, 0)).toFixed(decimalCount).slice(2) : '');
		} catch (e) {
			console.error(e);
		}
	}
	getStoreValues() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'ASC' }],
			0,
			1000
		);
		this.baseService.find(queryParams, 'buys').subscribe(res => {
			this.storeList = res.body.filter(hld => hld.stcode !== 'PRIM' && hld.customer.id === this.current.customer.id && hld.quoteStatus.label === 'Onaylandı');
			this.cdr.markForCheck();
		});
	}
}
