import {ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {QueryParamsModel} from "../../../models/query-params.model";
import {Utils} from "../../../utils";
import {BaseService} from "../../../base.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
	selector: 'kt-holiday-detail-dialog',
	templateUrl: './holiday-detail-dialog.component.html',
	styleUrls: ['./holiday-detail-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class HolidayDetailDialogComponent implements OnInit {
	model: any;
	current;
	usersHoliday = [];
	input1: string;
	input2: string;

	constructor(
		private cdr: ChangeDetectorRef,
		public baseService: BaseService,
		public snackBar: MatSnackBar,
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) { }

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.getCont();
	}

	syncInputs() {
		this.input2 = this.input1;
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

		return `${day}-${month}-${year}`;
	}


	getCont() {
		console.log(this.current.id);
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'user', sortOrder: 'DESC' }],
			0,
			500
		);
		const promise = new Promise((resolve, reject) => {
			this.baseService.find(queryParams, 'holusers').subscribe(
				res => {
					// İşlemler
					this.usersHoliday = [];
					for (const hld of res.body) {
						if (hld.user.id !== this.current.id) { continue; }
						this.usersHoliday.push({
							icon: 'kt-font-success',
							adsoyad: hld.user.firstName + ' ' + hld.user.lastName,
							baslangic: hld.isBas,
							dogtar: hld.dogTar,
							yilhak: hld.yilHak,
							kulyil: hld.kulYil,
							kalyil: hld.kalYil,
							topyil: hld.topYil,
							kulmaz: hld.kulMaz,
							kalmaz: hld.kalMaz,
							topkulmaz: hld.topKulMaz,
							yilgun: hld.yilGun,
							yildevir: hld.yilDevir,
							tophak: hld.topHak,
							topkul: hld.topKul,
							id: hld.id
						});
					}
					this.cdr.markForCheck();

					resolve(); // Promise'ı tamamla
				},
				error => {
					reject(error); // Hata durumunda Promise'ı reddet
				}
			);
		});
	}
}
