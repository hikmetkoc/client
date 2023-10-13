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
	templateUrl: 'base64-file-dialog.component.html',
})
export class Base64FileDialogComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	selectedFile: File | null = null;
	base64String: string | null = null;
	isUploading = true;
	fileName = '';

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
		this.fileName = this.selectedFile.name;
	}

	onUploadClick(): void {
		// Dosya yükleme butonuna tıklandığında tetiklenir.
		if (this.selectedFile) {
			this.convertToBinaryAndSendToAPI();
		}
	}
	onNoClick() {
		if (this.isUploading) {
			this.dialogRef.close();
		} else {
			Utils.showActionNotification('Lütfen dosya yüklemesinin tamamlanmasını bekleyiniz!', 'success', 5000, true, false, 3000, this.snackBar);
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
		const apiUrl = 'api/file_containers/uploadFile';
		const httpHeaders = this.httpUtils.getHTTPHeaders();

		reader.onload = (event: any) => {
			const binaryValue = event.target.result;
			const location = this.current.id.toString(); // ID'yi string olarak gönder
			const locName = this.model.name;
			const name = this.fileName;
			console.log(location + ' - ' + locName + ' - ' + name);
			this.http.post(apiUrl + `?location=${location}&locName=${locName}&name=${name}`, binaryValue, { headers: httpHeaders, responseType: 'text' }).subscribe(
				response => {
						Utils.showActionNotification(response, 'success', 5000, true, false, 3000, this.snackBar);
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
