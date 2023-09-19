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
	templateUrl: 'show-resign.component.html',
})
export class ShowResignComponent implements OnInit {
	@Input() current: any;
	@Input() model: any;
	resignList = [];

	constructor(
		private cdr: ChangeDetectorRef,
		private elRef: ElementRef,
		public baseService: BaseService,
		public dialogRef: MatDialogRef<any>,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public snackBar: MatSnackBar,
		private dateAdapter: DateAdapter<Date>
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
		this.getResign();
	}
	onNoClick() {
		this.dialogRef.close();
	}

	formatDate(date: string): string {
		if (!date) {
			return '';
		}
		const formattedDate = new Date(date);
		const day = ('0' + formattedDate.getDate()).slice(-2);
		const month = ('0' + (formattedDate.getMonth() + 1)).slice(-2);
		const year = formattedDate.getFullYear();
		const hour = ('0' + formattedDate.getHours()).slice(-2);
		const minute = ('0' + formattedDate.getMinutes()).slice(-2);
		return `${day}-${month}-${year}`;
	}

	getResign() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
			0,
			1000
		);
		this.baseService.find(queryParams, 'resigns').subscribe(res => {
			this.resignList = res.body.filter(flt => flt.owner.id === this.current.id);
			this.cdr.markForCheck();
		});
	}

	print() {
		const printContent = document.getElementById('print-section');
		const windowPrt = window.open('', '', 'left=0,top=0,width=1200,height=1200,toolbar=0,scrollbars=0,status=0');
		const style = `
<style>
  table {
    border-collapse: collapse;
    width: 100%;
    table-layout: auto;
    border: 1px solid #000;
    text-align: center;
  }

  table, thead, tr, td, th {
    border: 1px solid black;
    vertical-align: middle;
    text-align: center;
  }

  thead {
    background-color: #0f695f;
    color: #d7dbf7;
    font-weight: bold;
  }

tr:nth-child(even) {
	background-color: #f2f2f2;
	text-align: center;
}
  .question {
    text-align: left;
  }
</style>
`;
		windowPrt.document.write(style);
		windowPrt.document.write(printContent.innerHTML);
		windowPrt.document.close();
		windowPrt.focus();
		windowPrt.print();
		windowPrt.close();
	}
}
