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
	templateUrl: 'show-personel-contract.component.html',
	styleUrls: ['./personal-contact.component.scss']
})
export class ShowPersonelContractComponent implements OnInit {
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
		//this.print();
	}
	print(sozlesme) {
		const apiUrl = `api/personal_contracts/download-degistirilmis-belge?sozlesme=${sozlesme}`;
		const httpHeaders = this.httpUtils.getHTTPHeaders();

		this.http.post(apiUrl, this.current, {
			headers: httpHeaders,
			responseType: 'blob' as 'json', // Blob türünü kullan
		}).subscribe(
			(blob: Blob) => {
				const fileUrl = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href = fileUrl;

				// Dosya adını belirlemek için response headers'ından alabilirsiniz
				const contentDispositionHeader = blob.type;
				const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDispositionHeader);
				const fileName = matches != null && matches[1] ? matches[1].replace(/['"]/g, '') : 'document.docx';

				a.download = fileName;

				document.body.appendChild(a);
				a.click();

				// Temizlik
				window.URL.revokeObjectURL(fileUrl);
				document.body.removeChild(a);
			},
			error => {
				Utils.showActionNotification('Dosya bulunamadı!', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		);
		this.dialogRef.close();
	}

}
