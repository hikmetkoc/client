import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';

@Component({
	selector: 'kt-store-dialog',
	templateUrl: 'store-dialog.component.html',
})
export class StoreDialogComponent {

	constructor(
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dateAdapter: DateAdapter<Date>
	) {
	}

	onNoClick() {
		this.dialogRef.close();
	}
}
