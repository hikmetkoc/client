import {ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from '../../models/query-params.model';
import {Utils} from '../../utils';
import {BaseService} from '../../base.service';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {HttpUtilsService} from '../../http-utils.service';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
	selector: 'kt-resign',
	templateUrl: 'show-change-dbs-invoice.component.html',
	styleUrls: ['./show-change-dbs-invoice.component.scss']
})
export class ShowChangeDbsInvoiceComponent implements OnInit {
	@Input() current: any;
	@Input() model: any;

	constructor(
		private cdr: ChangeDetectorRef,
		private elRef: ElementRef,
		public baseService: BaseService,
		public dialogRef: MatDialogRef<any>,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public snackBar: MatSnackBar,
	) {
		if (data && data.model) {
			this.model = data.model;
		}
		if (data && data.current) {
			this.current = data.current;
		}
	}

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
	}

	changeDbs() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = this.current.id;
		const url = `api/invoice_lists/changeDbs?uuid=${id}`;
		this.http.post(url, null, { headers: httpHeaders})
			.subscribe(
				() => {
					this.dialogRef.close(true);
				},
				(error) => {
					console.error('Hata:', error);
				}
			);
	}
	onNoClick() {
		this.dialogRef.close();
	}
}
