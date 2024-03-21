import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {BaseService} from '../../base.service';
import {HttpClient} from '@angular/common/http';
import {HttpUtilsService} from '../../http-utils.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
	selector: 'kt-grid-okey',
	templateUrl: 'grid-okey.component.html',
})
export class GridOkeyComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	@Input() status: any;
	description: any;
	onayla: boolean;

	constructor(
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		public dialog: MatDialog,
		public baseService: BaseService,
		public snackBar: MatSnackBar,
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dateAdapter: DateAdapter<Date>
	) {
		if (data && data.model) {
			this.model = data.model;
			this.status = data.status;
		}
		if (data && data.current && data.paymentStatus) {
			this.current = data.current;
			this.status = data.status;
		}
	}
	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.status = this.data.status;
		this.onYesClick();
	}
	onYesClick() {
		this.baseService.update(this.current, this.model).subscribe(() => {
			this.dialogRef.close(true);
		});
	}
}
