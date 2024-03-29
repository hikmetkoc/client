import {ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {QueryParamsModel} from "../../../models/query-params.model";
import {Utils} from "../../../utils";
import {BaseService} from "../../../base.service";

@Component({
	selector: 'kt-report-manager-dialog',
	templateUrl: './report-manager-dialog.component.html',
	styleUrls: ['./report-manager-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class ReportManagerDialogComponent implements OnInit {
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
		//this.getCont();
	}

	onNoClick() {
		this.dialogRef.close();
	}
	formatDate(date: string): string {
		if (!date) return '';

		const formattedDate = new Date(date);
		const day = ('0' + formattedDate.getDate()).slice(-2);
		const month = ('0' + (formattedDate.getMonth() + 1)).slice(-2);
		const year = formattedDate.getFullYear();
		const hour = ('0' + formattedDate.getHours()).slice(-2);
		const minute = ('0' + formattedDate.getMinutes()).slice(-2);
		if (this.usersHoliday[0].izintur === 'Mazeret İzni') {
			return `${day}-${month}-${year} ${hour}:${minute}`;
		} else {
			return `${day}-${month}-${year}`;
		}
	}
	showFiles() {
		const printContent = document.getElementById('print-section');
		const windowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
		windowPrt.document.write('\
  <style>\
    table.table-striped {\
      border-collapse: collapse;\
      width: 90%;\
    }\
    table.table-striped td {\
      border: 2px solid #ddd;\
      padding: 8px;\
      text-align: left;\
      vertical-align: middle;\
    }\
    table.table-striped tr:nth-child(even) {\
      background-color: #f2f2f2;\
    }\
    table.table-striped th {\
      padding-top: 12px;\
      padding-bottom: 12px;\
      background-color: #4CAF50;\
      color: white;\
    }\
    table.table-striped td:nth-of-type(1) {\
      width: 40%;\
    }\
    table.table-striped td:nth-of-type(2) {\
      width: 60%;\
    }\
    table.table-striped2 {\
      border-collapse: collapse;\
      width: 90%;\
    }\
    .yazi {\
      font-size: 14px;\
      color: #333;\
      font-weight: bold;\
    }\
    table.table-striped2 td {\
      border: 2px solid #ddd;\
      padding: 8px;\
      text-align: left;\
      vertical-align: middle;\
    }\
    table.table-striped2 tr:nth-child(even) {\
      background-color: #f2f2f2;\
    }\
    table.table-striped2 th {\
      padding-top: 12px;\
      padding-bottom: 12px;\
      background-color: #4CAF50;\
      color: white;\
    }\
    table.table-striped2 td:nth-of-type(1) {\
      width: 20%;\
    }\
    table.table-striped2 td:nth-of-type(2) {\
      width: 25%;\
    }\
    table.table-striped2 td:nth-of-type(3) {\
      width: 25%;\
    }\
    table.table-striped2 td:nth-of-type(4) {\
      width: 30%;\
    }\
  </style>\
');

		windowPrt.document.write(printContent.innerHTML);
		windowPrt.document.close();
		windowPrt.focus();
		windowPrt.print();
		windowPrt.close();
	}
}
