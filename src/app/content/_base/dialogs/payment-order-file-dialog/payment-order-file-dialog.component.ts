import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {HttpUtilsService} from "../../http-utils.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
	selector: 'kt-payment-order-file-dialog',
	templateUrl: 'payment-order-file-dialog.component.html',
})
export class PaymentOrderFileDialogComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	selectedFile: File | null = null;
	base64String: string | null = null;
	isUploading: boolean;

	constructor(
		private cdr: ChangeDetectorRef,
		public baseService: BaseService,
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dateAdapter: DateAdapter<Date>,
		private http: HttpClient,
		public snackBar: MatSnackBar,
		private httpUtils: HttpUtilsService,
	) {
		if (data && data.model) {
			this.model = data.model;
		}
		if (data && data.current) {
			this.current = data.current;
		}
	}

	onFileSelected(event: any): void {
		// Kullanıcı dosya seçtiğinde tetiklenir.
		this.selectedFile = event.target.files[0];
	}

	onUploadClick(): void {
		// Dosya yükleme butonuna tıklandığında tetiklenir.
		if (this.selectedFile) {
			this.convertToBinaryAndSendToAPI();
		}
	}

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.isUploading = true;
	}

	convertToBinaryAndSendToAPI(): void {
		this.isUploading = false;
		const reader = new FileReader();
		const apiUrl = 'api/payment_orders/uploadPDF';
		const httpHeaders = this.httpUtils.getHTTPHeaders();

		reader.onload = (event: any) => {
			const binaryValue = event.target.result;
			const currentId = this.current.id.toString(); // ID'yi string olarak gönder

			this.http.post(apiUrl + `?id=${currentId}`, binaryValue, { headers: httpHeaders, responseType: 'text' }).subscribe(
				response => {
						Utils.showActionNotification('Dosya yüklemesi başarıyla tamamlandı!', 'success', 5000, true, false, 3000, this.snackBar);
						this.isUploading = true;
						this.dialogRef.close();
				},
				error => {
					console.error('Yükleme sırasında bir hata oluştu:', error);
				}
			);
		};
		reader.readAsArrayBuffer(this.selectedFile);
	}


}
