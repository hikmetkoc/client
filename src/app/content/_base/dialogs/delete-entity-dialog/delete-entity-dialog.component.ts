import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'kt-delete-entity-dialog',
	templateUrl: './delete-entity-dialog.component.html',
	styleUrls: ['./delete-entity-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class DeleteEntityDialogComponent implements OnInit {
	viewLoading = false;

	constructor(
		public dialogRef: MatDialogRef<DeleteEntityDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onYesClick(): void {
		/* Server loading imitation. Remove this */
		this.viewLoading = true;
		setTimeout(() => {
			this.dialogRef.close(true); // Keep only this row
		}, 2500);
	}
}
