import {ChangeDetectorRef, Component, Inject, Input, OnInit, ViewEncapsulation} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {QueryParamsModel} from '../../../models/query-params.model';
import {Utils} from '../../../utils';
import {BaseService} from '../../../base.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
	selector: 'kt-holiday-detail-dialog',
	templateUrl: './user-evaluation-form-dialog.component.html',
	styleUrls: ['./user-evaluation-form-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class UserEvaluationFormDialogComponent implements OnInit {
	@Input() current: any;
	@Input() model: any;
	chiefData = [];
	totalPoint: number;

	constructor(
		private cdr: ChangeDetectorRef,
		public baseService: BaseService,
		public snackBar: MatSnackBar,
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
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
		this.getData();
	}
	onNoClick() {
		this.dialogRef.close();
	}
	showFiles() {
		const printContent = document.getElementById('print-section');
		const windowPrt = window.open('', '', 'left=0,top=0,width=2000,height=2000,toolbar=0,scrollbars=0,status=0');
		windowPrt.document.write('<style> \
	.deneme-suresi-degerlendirme-tablosu {\
\tborder-collapse: collapse;\
\twidth: 100%;\
\tcolor: black;\
}\
\
.deneme-suresi-degerlendirme-tablosu th,\
.deneme-suresi-degerlendirme-tablosu td {\
\tborder: 1px solid #ddd;\
\tpadding: 8px;\
\ttext-align: left;\
\tcolor: black;\
}\
\
.deneme-suresi-degerlendirme-tablosu th {\
\tbackground-color: #f2f2f2;\
\tcolor: black;\
}\
\
.onaylar {\
\tborder: 1px solid #ddd;\
\tbackground-color: #f2f2f2;\
\tcolor: black;\
\tfont-weight: bold;\
\tpadding: 8px;\
\ttext-align: center;\
}\
\
.deneme-suresi-ortala td {\
\tborder: 1px solid #ddd;\
\tpadding: 6px;\
\ttext-align: center;\
\tcolor: black;\
}\
.genis-sutun {\
\twidth: 200px;\
}\
</style>');
		windowPrt.document.write(printContent.innerHTML);
		windowPrt.document.close();
		windowPrt.focus();
		windowPrt.print();
		windowPrt.close();
	}
	formatDate(date: string): string {
		if (!date) { return ''; }

		const formattedDate = new Date(date);
		const day = ('0' + formattedDate.getDate()).slice(-2);
		const month = ('0' + (formattedDate.getMonth() + 1)).slice(-2);
		const year = formattedDate.getFullYear();
		const hour = ('0' + formattedDate.getHours()).slice(-2);
		const minute = ('0' + formattedDate.getMinutes()).slice(-2);

		return `${day}-${month}-${year}`;
	}

	formatDate2(date: string): string {
		const formattedDate = new Date(date);
		const yeniTarih: Date = new Date(formattedDate.getTime() + (60 * 24 * 60 * 60 * 1000)); // Milisaniye cinsinden 60 gün ekledim
		const day = ('0' + yeniTarih.getDate()).slice(-2);
		const month = ('0' + (yeniTarih.getMonth() + 1)).slice(-2);
		const year = yeniTarih.getFullYear();
		const hour = ('0' + yeniTarih.getHours()).slice(-2);
		const minute = ('0' + yeniTarih.getMinutes()).slice(-2);

		return `${day}-${month}-${year}`;
	}

	getData() {
		this.totalPoint = 0;
		const filters = new Set();
		filters.add({
			name: 'user.id',
			operator: 'EQUALS',
			value: this.current.id
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{sortBy: 'createdDate', sortOrder: 'DESC'}],
			0,
			1000
		);
		this.baseService.find(queryParams, 'user_evaluation_forms').subscribe(res => {
			this.chiefData = res.body;
			this.totalPoint = parseInt(this.chiefData[0].isBilgisi.label, 10)
				+ parseInt(this.chiefData[0].kararVerme.label, 10)
				+ parseInt(this.chiefData[0].planlama.label, 10)
				+ parseInt(this.chiefData[0].kaynakKullanimi.label, 10)
				+ parseInt(this.chiefData[0].liderlik.label, 10)
				+ parseInt(this.chiefData[0].kurallaraUyma.label, 10)
				+ parseInt(this.chiefData[0].meslekiOzellikler.label, 10)
				+ parseInt(this.chiefData[0].isKalitesi.label, 10)
				+ parseInt(this.chiefData[0].takimCalismasi.label, 10)
				+ parseInt(this.chiefData[0].beseriIliskiler.label, 10);
			this.cdr.markForCheck();
		});
	}
}
