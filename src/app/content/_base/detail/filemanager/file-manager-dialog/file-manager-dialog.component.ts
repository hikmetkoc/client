import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'kt-file-manager-dialog',
	templateUrl: './file-manager-dialog.component.html',
	styleUrls: ['./file-manager-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class FileManagerDialogComponent implements OnInit {
	model: any;
	current;

	constructor(
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) { }

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
	}

	onNoClick() {
		this.dialogRef.close();
	}
}
