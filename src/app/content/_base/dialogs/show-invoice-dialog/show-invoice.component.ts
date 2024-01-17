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
	templateUrl: 'show-invoice.component.html',
})
export class ShowInvoiceComponent implements OnInit {
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
	}
	onNoClick() {
		this.dialogRef.close();
	}
	async showInvoice() {
		try {
			const apiUrl = 'api/file_containers/showFile';
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const locName = this.model.name;
			const location = this.current.id.toString();

			const response = await this.http.get(apiUrl + `?location=${location}&locName=${locName}&subject=E-Fatura`, { headers: httpHeaders, responseType: 'text' }).toPromise();

			const decodedData = atob(response);
			const cleanData = decodedData.replace(/\s+/g, '');
			const fileSignature = decodedData.substring(0, 4);
			console.log(fileSignature);
			let fileType: string;

			if (fileSignature === '%PDF') {
				fileType = 'application/pdf';
			} else if (fileSignature === 'ÿØÿâ' || fileSignature === 'ÿÛÿà' || fileSignature === '/9j/' || fileSignature === 'ÿØÿà') {
				fileType = 'image/jpeg';
			} else if (fileSignature === 'PNG') {
				fileType = 'image/png';
			} else if (fileSignature === 'GIF8') {
				fileType = 'image/gif';
			} else if (fileSignature === 'RIFF' && decodedData.substr(8, 4) === 'WEBP') {
				fileType = 'image/webp';
			} else if (fileSignature === 'II*\x00' || fileSignature === 'MM\x00*') {
				fileType = 'image/tiff';
			} else {
				Utils.showActionNotification('Dosya eksik veya hatalı yüklendi!', 'warning', 10000, true, false, 3000, this.snackBar);
				return;
			}

			const uint8Array = new Uint8Array(decodedData.length);
			for (let i = 0; i < decodedData.length; ++i) {
				uint8Array[i] = decodedData.charCodeAt(i);
			}

			const blob = new Blob([uint8Array], { type: fileType });
			const fileUrl = URL.createObjectURL(blob);
			window.open(fileUrl, '_blank');
		} catch (error) {
			Utils.showActionNotification('Dosya bulunamadı!', 'warning', 10000, true, false, 3000, this.snackBar);
		}
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
	formatCurrency(amount, decimalCount = 2, decimal = ',', thousands = '.') {
		try {
			decimalCount = Math.abs(decimalCount);
			decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

			const negativeSign = amount < 0 ? '-' : '';

			const i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount), 0).toString();
			const j = (i.length > 3) ? i.length % 3 : 0;

			return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j)
				.replace(/(\d{3})(?=\d)/g, '$1' + thousands) + (decimalCount ? decimal + Math.abs(amount - parseInt(i, 0)).toFixed(decimalCount).slice(2) : '');
		} catch (e) {
			console.error(e);
		}
	}
}
