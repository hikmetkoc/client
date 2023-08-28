import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { BaseService } from '../../base.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'kt-filter-save-dialog',
	templateUrl: './filter-save-dialog.component.html',
	styleUrls: ['./filter-save-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class LayoutSaveDialogComponent implements OnInit {
	model: any;
	filterName: any;
	layout;
	name = new FormControl('', [
		Validators.required,
		Validators.minLength(3)
	]);
	showErrors = false;

	constructor(
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public baseService: BaseService,
		private snackBar: MatSnackBar,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		this.model = this.data.model;
		this.layout = this.data.layout;
	}

	onSubmit() {
		if (this.name.errors === null) {
			const _entity = {
				name: this.filterName,
				values: JSON.stringify(this.layout)
			};
			this.dialogRef.close(_entity);
		} else {
			this.showErrors = true;
		}
	}

	onNoClick() {
		this.dialogRef.close();
	}
}
