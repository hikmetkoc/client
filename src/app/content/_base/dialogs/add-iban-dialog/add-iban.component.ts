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


@Component({
	selector: 'kt-resign',
	templateUrl: 'add-iban.component.html',
})
export class AddIbanComponent implements OnInit {
	@Input() current: any;
	@Input() model: any;
	bankList = [];
	moneyTypeList = [];
	iban = '';
	selectedBankId: any;
	selectedMoneyTypeId: any;
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

	onNoClick() {
		this.dialogRef.close();
	}

	onYesClick() {
		if (this.iban.length !== 32) {
			Utils.showActionNotification('IBAN 26 hane olmak zorundadır!', 'error', 2000, true, false, 3000, this.snackBar);
		} else if (this.selectedBankId === undefined || this.selectedMoneyTypeId === undefined) {
			Utils.showActionNotification('Lütfen tüm alanları doldurun!', 'error', 2000, true, false, 3000, this.snackBar);
		} else {
			const dialogRef = this.dialog.open(AreYouOkeyComponent, {
				width: '800px'
			});
			dialogRef.afterClosed().subscribe((result) => {
				if (result === 'yes') {
					const url = '/api/ibans/newIban';
					const httpHeaders = this.httpUtils.getHTTPHeaders();
					this.http.put(url + `?bank=${this.selectedBankId}&moneyType=${this.selectedMoneyTypeId}&customer=${this.current}&name=${this.iban}` , null, {headers: httpHeaders, responseType: 'text'}).subscribe(
						(res: any) => {
							this.dialogRef.close(this.iban);
							Utils.showActionNotification('Kayıt Başarılı!', 'success', 10000, true, false, 3000, this.snackBar);
							},
						(error) => {
							// HTTP isteği tamamen başarısız oldu
							console.error('Hata:', error);
							Utils.showActionNotification('Bu IBAN zaten kayıtlıdır!.', 'error', 10000, true, false, 3000, this.snackBar);
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

	getAttributeValues() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{sortBy: 'label', sortOrder: 'ASC'}],
			0,
			3000
		);
		this.baseService.find(queryParams, 'attribute-values').subscribe(res => {
			this.bankList = res.body.filter(hld => hld.attribute.id === 'Müş_Bnk');
			this.moneyTypeList = res.body.filter(hld => hld.attribute.id === 'Par_Bir');
			this.cdr.markForCheck();
		});
	}
}
