import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";

@Component({
	selector: 'kt-send-invoice',
	templateUrl: 'send-invoice.component.html',
})
export class SendInvoiceComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	invoices = [];
	userList = [];
	selectedUserId: any;

	constructor(
		private cdr: ChangeDetectorRef,
		public baseService: BaseService,
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

	onNoClick() {
		this.dialogRef.close();
	}

	onYesClick() {
		this.current.owner = this.selectedUserId;
		this.current.description = '';
		this.current.invoiceStatus = this.baseService.getAttrVal('Fatura_Durumlari_Atandi');
		this.baseService.update(this.current, 'invoice_lists').subscribe(() => {
			this.dialogRef.close();
		});
	}

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		//this.getHoliday();
		this.getUsers();
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

	getHoliday () {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
			0,
			10000
		);
		this.baseService.find(queryParams, 'invoice_lists').subscribe(res => {
			this.invoices = [];
			for (const hld of res.body) {
				if (hld.id !== this.current.id) { continue; }
				this.invoices.push({
					faturatarihi: hld.invoiceDate,
					gonderimtarihi: hld.sendDate,
					faturanumarasi: hld.invoiceNum,
					tedarikci: hld.customer.name,
					sirket: hld.sirket.label,
					id: hld.id
				});
			}
			this.cdr.markForCheck();
		});
	}
	getUsers() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'firstName', sortOrder: 'ASC' }],
			0,
			10000
		);
		this.baseService.find(queryParams, 'users').subscribe(res => {
			this.userList = res.body.filter(hld => hld.activated === true && (hld.roles.some(role => role.id === 'ROLE_SATIN_ALMA') || hld.roles.some(role => role.id === 'ROLE_TAL')));
			this.cdr.markForCheck();
		});
	}

}
