import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostListener,
	Inject,
	Input,
	OnInit,
	Renderer2,
	ViewChild
} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from '../../models/query-params.model';
import {Utils} from '../../utils';
import {BaseService} from '../../base.service';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {HttpUtilsService} from '../../http-utils.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormBuilder, FormGroup} from "@angular/forms";


@Component({
	selector: 'kt-resign',
	templateUrl: 'new-person.component.html',
})
export class NewPersonComponent implements OnInit {
	@Input() current: any;
	@Input() model: any;
	sirketList = [];
	unvanList = [];
	ad = '';
	soyad = '';
	tc = '';
	cep = '';
	selectedSirketId: any;
	selectedUnvanId: any;
	birthDate: any;
	startDate: any;
	utils = Utils;

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

	onNoClick() {
		this.dialogRef.close();
	}

	onYesClick() {
		if (this.tc.length !== 11) {
			Utils.showActionNotification('TC 11 hane olmak zorundadır!', 'error', 2000, true, false, 3000, this.snackBar);
		} else if (this.cep === '' || this.ad === '' || this.soyad === '' || this.selectedSirketId === undefined || this.selectedUnvanId === undefined || this.birthDate === undefined || this.startDate === undefined) {
			Utils.showActionNotification('Lütfen tüm alanları doldurun!', 'error', 2000, true, false, 3000, this.snackBar);
		} else {
			const url = '/api/users/newPerson';
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			this.birthDate = Utils.dateFormatForApi(this.birthDate);
			this.startDate = Utils.dateFormatForApi(this.startDate);
			console.log(this.birthDate);
			const assigner = this.baseService.getUser();
			this.http.put(url + `?tc=${this.tc}&baslangic=${this.startDate}&dogum=${this.birthDate}
		&cep=${this.cep}&ad=${this.ad}&soyad=${this.soyad}
		&unvan=${this.selectedUnvanId}&sgkSirket=${this.selectedSirketId}` , assigner, {headers: httpHeaders, responseType: 'text'}).subscribe(
				(res: any) => {
						this.dialogRef.close();
						Utils.showActionNotification('Kayıt Başarılı!', 'success', 10000, true, false, 3000, this.snackBar);
				},
				(error) => {
					// HTTP isteği tamamen başarısız oldu
					console.error('Hata:', error);
					Utils.showActionNotification('İşlem yapılırken bir hata oluştu.', 'error', 10000, true, false, 3000, this.snackBar);
				}
			);
		}
	}

	onKeyDown(event: KeyboardEvent) {
		// Klavyeden girilen tuşu al
		const key = event.key;

		// Eğer girilen tuş bir rakam değilse ve backspace veya delete tuşları değilse, olayı engelle
		if (isNaN(Number(key)) && key !== 'Backspace' && key !== 'Delete') {
			event.preventDefault();
		}
	}


	onInput(event: any) {
		const inputValue = event.target.value;
		const numericValue = inputValue.replace(/\D/g, ''); // Sadece rakamları al

		if (numericValue.length > 11) {
			this.tc = numericValue.slice(0, 11); // 11 haneyi aşmayacak şekilde sınırla
		} else {
			this.tc = numericValue;
		}
	}


	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.getAttributeValues();
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

	getAttributeValues() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{sortBy: 'label', sortOrder: 'ASC'}],
			0,
			10000
		);
		this.baseService.find(queryParams, 'attribute-values').subscribe(res => {
			this.unvanList = res.body.filter(hld => hld.attribute.id === 'Unvanlar');
			this.sirketList = res.body.filter(hld => hld.attribute.id === 'Sirketler');
			this.cdr.markForCheck();
		});
	}
}
