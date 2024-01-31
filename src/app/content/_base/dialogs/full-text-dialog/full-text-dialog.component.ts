// full-text-dialog.component.ts
import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BaseService} from "../../base.service";
import {HttpClient} from "@angular/common/http";
import {HttpUtilsService} from "../../http-utils.service";
import {catchError} from "rxjs/operators";
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {DateAdapter} from "@angular/material/core";

@Component({
	selector: 'kt-full-text-dialog',
	templateUrl: 'full-text-dialog.component.html',
})
export class FullTextDialogComponent  implements OnInit {
	@Input() fullText: any;

	constructor(
		private cdr: ChangeDetectorRef,
		public baseService: BaseService,
		public dialogRef: MatDialogRef<any>,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dateAdapter: DateAdapter<Date>
	) {
		if (data && data.fullText) {
			this.fullText = data.fullText;
		}
	}

	onNoClick() {
		this.dialogRef.close();
	}
	ngOnInit() {
		this.fullText = this.data.fullText;
	}
}
