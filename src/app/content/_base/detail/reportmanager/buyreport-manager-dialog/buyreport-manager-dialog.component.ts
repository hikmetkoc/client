import {ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {QueryParamsModel} from "../../../models/query-params.model";
import {Utils} from "../../../utils";
import {BaseService} from "../../../base.service";

@Component({
	selector: 'kt-buyreport-manager-dialog',
	templateUrl: './buyreport-manager-dialog.component.html',
	styleUrls: ['./buyreport-manager-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class BuyReportManagerDialogComponent implements OnInit {
	model: any;
	current;
	stores = [];
	buys = [];
	buys2 = [];
	products = [];
	toplamurun: any;
	toplamtutar: any;
	onayurun: any;
	onaytutar: any;

	constructor(
		private cdr: ChangeDetectorRef,
		public baseService: BaseService,
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) { }

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.getCont();
	}

	onNoClick() {
		this.dialogRef.close();
	}
	showFiles() {
		const printContent = document.getElementById('print-section');
		const windowPrt = window.open('', '', 'left=0,top=0,width=1200,height=1200,toolbar=0,scrollbars=0,status=0');
		windowPrt.document.write('<style> \
	table.table-striped { \
		border-collapse: collapse; \
		width: 100%; \
		text-align: center; \
	} \
	table.table-striped td { \
		border: 2px solid #ddd; \
		padding: 8px; \
		text-align: center; \
		vertical-align: middle; \
	} \
	table.table-striped tr:nth-child(even) { \
		background-color: #f2f2f2; \
		text-align: center; \
	} \
	table.table-striped th { \
		padding-top: 12px; \
		text-align: center; \
		padding-bottom: 12px; \
		background-color: #4CAF50; \
		color: black; \
	} \
</style>');



		windowPrt.document.write(printContent.innerHTML);
		windowPrt.document.close();
		windowPrt.focus();
		windowPrt.print();
		windowPrt.close();
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


	getCont() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
			0,
			1000
		);
		this.baseService.find(queryParams, 'stores').subscribe(res => {
			this.stores = [];
			for (const hld of res.body) {
				if (hld.id !== this.current.id) { continue; }
				this.stores.push({
					icon: 'kt-font-success',
					nu: hld.stcode,
					talepeden: hld.assigner.firstName + ' ' + hld.assigner.lastName,
					onaykisisi: hld.owner.firstName + ' ' + hld.owner.lastName,
					sirket: hld.sirket.label,
					maliyet: hld.maliyet.label,
					sontarih: hld.endDate,
					urun: hld.request,
					gerekce: hld.description,
					status: hld.status.label,
					buystatus: hld.buyStatus.label,
					tarih: hld.createdDate,
					id: hld.id
				});
			}
			this.cdr.markForCheck();
		});
		this.baseService.find(queryParams, 'buys').subscribe(res => {
			this.buys = [];
			for (const hld of res.body) {
				if (hld.quoteStatus.label !== 'Onaylandı' || hld.store.id !== this.current.id) { continue; }
				this.buys.push({
					icon: 'kt-font-success',
					talepeden: hld.owner.firstName + ' ' + hld.owner.lastName,
					oneri: hld.suggest,
					onermetarih: hld.okeyFirst,
					onay2: hld.secondAssigner.firstName + ' ' + hld.secondAssigner.lastName,
					onay2tarih: hld.okeySecond,
					tedarikci: hld.customer.name,
					baslangic: hld.startDate,
					bitis: hld.endDate,
					vade: hld.maturityDate,
					tutar: hld.fuelTl,
					para: hld.moneyType.label,
					onaytutar: hld.onayTl,
					odeme: hld.paymentMethod.label,
					gerekce: hld.description,
					durum: hld.quoteStatus.label,
					tarih: hld.createdDate,
					id: hld.id
				});
			}
			this.cdr.markForCheck();
		});
		this.baseService.find(queryParams, 'buys').subscribe(res => {
			this.buys2 = [];
			for (const hld of res.body) {
				if (hld.store.id !== this.current.id || hld.quoteStatus.label === 'Onaylandı') { continue; }
				this.buys2.push({
					icon: 'kt-font-success',
					onay: hld.quoteStatus.label,
					talepeden: hld.owner.firstName + ' ' + hld.owner.lastName,
					oneri: hld.suggest,
					onermetarih: hld.okeyFirst,
					onay2: hld.secondAssigner.firstName + ' ' + hld.secondAssigner.lastName,
					onay2tarih: hld.okeySecond,
					tedarikci: hld.customer.name,
					baslangic: hld.startDate,
					bitis: hld.endDate,
					vade: hld.maturityDate,
					tutar: hld.fuelTl,
					para: hld.moneyType.label,
					onaytutar: hld.onayTl,
					odeme: hld.paymentMethod.label,
					gerekce: hld.description,
					tarih: hld.createdDate,
					id: hld.id
				});
			}
			this.cdr.markForCheck();
		});
		this.toplamurun = 0;
		this.toplamtutar = 0;
		this.onayurun = 0;
		this.onaytutar = 0;
		/*this.baseService.find(queryParams, 'contproducts').subscribe(res => {
			this.products = [];
			for (const hld of res.body) {
				console.log(this.buys[0].id + ' --- ' + hld.buy.id);
				if (hld.buy.id !== this.buys[0].id) { continue; }
				this.products.push({
					icon: 'kt-font-success',
					talepeden: hld.assigner.firstName + ' ' + hld.assigner.lastName,
					onaykisisi: hld.owner.firstName + ' ' + hld.owner.lastName,
					tur: hld.talepturu.label,
					tanim: hld.description,
					miktar: hld.miktar,
					ozellik: hld.ozellik,
					gerekce: hld.gerekce,
					tutar: hld.fuelTl,
					onem: hld.importance.label,
					onay: hld.status,
					id: hld.id
				});
				this.toplamurun++;
				this.toplamtutar += this.products[this.products.length - 1].tutar;
				if (this.products[this.products.length - 1].onay === true) {
					this.onayurun++;
					this.onaytutar += this.products[this.products.length - 1].tutar;
				}
			}
			console.log(this.onayurun);
			this.cdr.markForCheck();
		});*/
	}
}
