import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';

@Component({
	selector: 'kt-holiday-report-dialog',
	templateUrl: 'holiday-report-dialog.component.html',
})
export class HolidayReportDialogComponent {
	startDate = new Date();
	endDate = new Date();
	year = new Date().getFullYear();
	months: string[] = [
		'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
	];

	years: number[] = [];
	selectedMonth: string;
	selectedYear: number;

	constructor(
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dateAdapter: DateAdapter<Date>
	) {
		this.startDate.setDate(1);
		for (let i = 2023; i <= this.year; i++) {
			this.years.push(i);
		}
		const currentYear = new Date().getFullYear();
		for (let year = currentYear + 1; year <= currentYear + 10; year++) {
			this.years.push(year);
		}

		this.dateAdapter.setLocale('tr');
		this.dateAdapter.getFirstDayOfWeek = () => 1;
	}

	onSubmit() {
		this.dialogRef.close({ selectedYear: this.selectedYear, selectedMonth: this.selectedMonth });
	}
}
