import {ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {QueryParamsModel} from "../../../models/query-params.model";
import {Utils} from "../../../utils";
import {BaseService} from "../../../base.service";

@Component({
	selector: 'kt-ikreport-manager-dialog',
	templateUrl: './ikreport-manager-dialog.component.html',
	styleUrls: ['./ikreport-manager-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class IkReportManagerDialogComponent implements OnInit {
	model: any;
	current;
	usersHoliday = [];
	sd: any;
	ed: any;
	dd: any;
	bd: any;

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
		const windowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
		windowPrt.document.write('<style> \
	table.table-striped { \
		border-collapse: collapse; \
		width: 90%; \
	} \
	table.table-striped td { \
		border: 2px solid #ddd; \
		padding: 8px; \
		text-align: left; \
		vertical-align: middle; \
	} \
	table.table-striped tr:nth-child(even) { \
		background-color: #f2f2f2; \
	} \
	table.table-striped th { \
		padding-top: 12px; \
		padding-bottom: 12px; \
		background-color: #4CAF50; \
		color: white; \
	} \
	table.table-striped td:nth-of-type(1) { \
		width: 10%; \
	} \
	table.table-striped td:nth-of-type(2) { \
		width: 80%; \
	} \
	table.table-striped td:nth-of-type(3) { \
		width: 10%; \
	} \
</style>');



		windowPrt.document.write(printContent.innerHTML);
		windowPrt.document.close();
		windowPrt.focus();
		windowPrt.print();
		windowPrt.close();
	}
	getCont() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
			0,
			100
		);
		this.baseService.find(queryParams, 'ikfiles').subscribe(res => {
			this.usersHoliday = [];
			for (const hld of res.body) {
				if (hld.id !== this.current.id) { continue; }
				this.usersHoliday.push({
					icon: 'kt-font-success',
					nufus: hld.nufus,
					nufuskayit: hld.nufuskayit,
					ikametgah: hld.ikametgah,
					saglik: hld.saglik,
					diploma: hld.diploma,
					sicil: hld.sicil,
					vesikalik: hld.vesikalik,
					ailedurum: hld.ailebelge,
					askerlik: hld.askerlik,
					issozlesme: hld.issozlesme,
					sgk: hld.sgk,
					fazla: hld.fazlamesai,
					kvk: hld.kvk,
					ehliyet: hld.ehliyet,
					zimmet: hld.zimmetliarac,
					gizlilik: hld.gizlilik,
					istanimi: hld.istanimi,
					id: hld.id
				});
			}
			this.cdr.markForCheck();
		});
		const options = { timeZone: 'Europe/Istanbul', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
		this.sd = this.usersHoliday[0].baslangic;
		this.ed = this.usersHoliday[0].bitis;
		this.dd = this.usersHoliday[0].donus;
		this.bd = this.usersHoliday[0].isebaslangic;
	}
}
