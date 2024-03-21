import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostListener,
	Inject,
	Input,
	OnInit,
	Renderer2,
	ViewChild
} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from '../../models/query-params.model';
import {Utils} from '../../utils';
import {BaseService} from '../../base.service';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {HttpUtilsService} from '../../http-utils.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ShowResignComponent} from "../../detail/show-resign-dialog/show-resign.component";
import {MatDialog} from "@angular/material/dialog";
import {
	ShowPersonelContractComponent
} from "../../detail/show-personel-contract-dialog/show-personel-contract.component";
import {AreYouOkeyComponent} from "../are-you-okey-dialog/are-you-okey.component";
import {formatCurrency} from "@angular/common";


@Component({
	selector: 'kt-add-spend',
	templateUrl: 'add-spend.component.html',
})
export class AddSpendComponent implements OnInit {
	@Input() current: any;
	@Input() model: any;
	exchangeList = [];
	typeList = [];
	description = '';
	selectedTypeId: any;
	selectedDate: any;
	selectedAmount: any;
	selectedExchangeId: any;
	utils = Utils;

	constructor(
		private cdr: ChangeDetectorRef,
		private elRef: ElementRef,
		public baseService: BaseService,
		public dialog: MatDialog,
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

	filterOptions(name: any) {
		if (name === 'type') {
		}
		if (name === 'country') {
		}
	}

	onNoClick() {
		this.dialogRef.close();
	}

	onYesClick() {
		if (this.selectedDate === undefined || this.selectedAmount === undefined) {
			Utils.showActionNotification('Lütfen tüm alanları doldurun!', 'error', 2000, true, false, 3000, this.snackBar);
		} else {
			const dialogRef = this.dialog.open(AreYouOkeyComponent, {
				width: '800px'
			});
			dialogRef.afterClosed().subscribe((result) => {
				if (result === 'yes') {
					const url = '/api/spends/addSpend';
					const httpHeaders = this.httpUtils.getHTTPHeaders();
					const startDate1 = new Date(this.selectedDate);
					const startDate = this.formatDate(startDate1);
					const paymentOrder = this.current;
					const amount = this.formatCurrency(this.selectedAmount);
					this.http.put(url + `?&pid=${this.current.id}&description=${this.description}&date=${startDate.toString()}&amount=${this.selectedAmount}` , paymentOrder, {headers: httpHeaders, responseType: 'text'}).subscribe(
						(res: any) => {
							this.dialogRef.close(this.description);
							Utils.showActionNotification('Kayıt Başarılı!', 'success', 4000, true, false, 3000, this.snackBar);
							},
						(error) => {
							// HTTP isteği tamamen başarısız oldu
							const errorr = JSON.parse(error.error);
							console.log(errorr);
							Utils.showActionNotification(errorr.detail, 'error', 4000, true, false, 3000, this.snackBar);
						}
					);
				}
			});
		}
	}

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.getAttributeValues();
	}
	formatDate (date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
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

	getAttributeValues() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{sortBy: 'label', sortOrder: 'ASC'}],
			0,
			3000
		);
		this.baseService.find(queryParams, 'attribute-values').subscribe(res => {
			this.exchangeList = res.body.filter(hld => hld.attribute.id === 'Exchange_Date');
			this.typeList = res.body.filter(hld => hld.attribute.id === 'PaymentType');
			this.cdr.markForCheck();
		});
	}
}
