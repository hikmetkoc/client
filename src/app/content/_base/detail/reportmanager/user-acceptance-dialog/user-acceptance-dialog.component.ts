import {ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {QueryParamsModel} from "../../../models/query-params.model";
import {Utils} from "../../../utils";
import {BaseService} from "../../../base.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
	selector: 'kt-holiday-detail-dialog',
	templateUrl: './user-acceptance-dialog.component.html',
	styleUrls: ['./user-acceptance-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class UserAcceptanceDialogComponent implements OnInit {
	model: any;
	current;
	usersAcceptance = [];
	input1: string;
	input2: string;
	bilgiislem: string;
	otobil: string;
	finans: string;

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
		this.getAcceptance();
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


	getAcceptance() {
		const filters = new Set();
		filters.add({
			name: 'user.id',
			operator: 'EQUALS',
			value: this.current.id
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{sortBy: 'createdDate', sortOrder: 'DESC'}],
			0,
			1000
		);
		this.baseService.find(queryParams, 'user_acceptances').subscribe(res => {
			this.usersAcceptance = res.body;
			console.log(this.usersAcceptance.length);
			this.cdr.markForCheck();
		});

		/*for (let i = 0; i <= this.usersAcceptance.length - 1; i++) {
			if (this.usersAcceptance[i].type.id !== 'Material_Type_Araba'
			|| this.usersAcceptance[i].type.id !== 'Material_Type_Kredi_Karti') {
				if (this.bilgiislem === '') {
					this.bilgiislem = i.toString();
				} else {
					this.bilgiislem = this.bilgiislem + ', ' + i;
				}
			} else if (this.usersAcceptance[i].type.id !== 'Material_Type_Araba') {
				if (this.otobil === '') {
					this.otobil = i.toString();
				} else {
					this.otobil = this.otobil + ', ' + i;
				}
			} else if (this.usersAcceptance[i].type.id !== 'Material_Type_Kredi_Karti') {
				if (this.finans === '') {
					this.finans = i.toString();
				} else {
					this.finans = this.finans + ', ' + i;
				}
			}
		}*/
		//console.log(this.bilgiislem + ' - ' + this.otobil + ' - ' + this.finans);
	}
}
