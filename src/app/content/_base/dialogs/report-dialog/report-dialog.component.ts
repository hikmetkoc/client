import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';

@Component({
	selector: 'kt-report-dialog',
	templateUrl: 'report-dialog.component.html',
})
export class ReportDialogComponent {
	startDate = new Date();
	endDate = new Date();
	year = new Date().getFullYear();
	years = [];

	constructor(
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dateAdapter: DateAdapter<Date>
	) {
		this.startDate.setDate(1);
		for (let i = 2017; i <= this.year; i++) {
			this.years.push(i);
		}

		this.dateAdapter.setLocale('tr');
		this.dateAdapter.getFirstDayOfWeek = () => 1;
	}

	onSubmit() {
		this.startDate.setHours(0);
		this.startDate.setMinutes(0);
		this.startDate.setMilliseconds(0);
		this.endDate.setHours(23);
		this.endDate.setMinutes(59);
		this.endDate.setMilliseconds(999);
		this.dialogRef.close({ startDate: this.startDate, endDate: this.endDate, year: this.year });
	}
}
