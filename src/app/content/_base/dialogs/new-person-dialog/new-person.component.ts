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
import {HttpClient} from '@angular/common/http';
import {HttpUtilsService} from '../../http-utils.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {AreYouOkeyComponent} from '../are-you-okey-dialog/are-you-okey.component';


@Component({
	selector: 'kt-resign',
	templateUrl: 'new-person.component.html',
})
export class NewPersonComponent implements OnInit {
	@Input() current: any;
	@Input() model: any;
	sirketList = [];
	unvanList = [];
	egitimList = [];
	askerlikList = [];
	cinsiyetList = [];
	ehliyetList = [];
	birimList = [];
	insuranceCompanyList = [];
	ad = '';
	soyad = '';
	tc = '';
	cep = '';
	email = '';
	acilAdSoyad = '';
	acilYakinlik = '';
	acilNo = '';
	acikAdres = '';
	dogIl = '';
	dogIlce = '';
	mezunKurum = '';
	mezunBolum = '';
	iban = null;
	muaf = null;
	kangrubu = null;
	aciklamaAlani = null;
	emekli: any;
	engelli: any;
	escalisma: any;
	tcv: any = true;
	mybelgesi = false;
	whiteCollar = false;
	selectedEgitimId: any;
	selectedInsuranceCompanyId: any;
	selectedSirketId: any;
	selectedUnvanId: any;
	selectedAskerlikId: any;
	selectedEhliyetId: any;
	selectedCinsiyetId: any;
	selectedBirimId: any;
	birthDate: any;
	startDate: any;
	utils = Utils;

	constructor(
		private cdr: ChangeDetectorRef,
		private elRef: ElementRef,
		public baseService: BaseService,
		public dialog: MatDialog,
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
		} else if (this.cep === '' || this.ad === '' || this.soyad === ''  || this.email === '' || this.selectedSirketId === undefined || this.selectedInsuranceCompanyId === undefined ||
			this.selectedUnvanId === undefined || this.birthDate === undefined || this.startDate === undefined ||
			this.selectedEgitimId === undefined || this.selectedAskerlikId === undefined || this.selectedCinsiyetId === undefined ||
			this.selectedEhliyetId === undefined || this.selectedBirimId === undefined || this.mezunKurum === ''  || this.mezunBolum === ''  || this.acilAdSoyad === '' ||
			this.acilYakinlik === '' || this.acilNo === '' || this.dogIl === '' || this.dogIlce === '' || this.acikAdres === '' ||
			this.iban === '' || this.kangrubu === '') {
			Utils.showActionNotification('Lütfen tüm alanları doldurun!', 'error', 2000, true, false, 3000, this.snackBar);
		} else {
			const dialogRef = this.dialog.open(AreYouOkeyComponent, {
				width: '800px'
			});
			dialogRef.afterClosed().subscribe((result) => {
				if (result === 'yes') {
					const url = '/api/users/newPerson';
					const httpHeaders = this.httpUtils.getHTTPHeaders();
					this.birthDate = Utils.dateFormatForApi(this.birthDate);
					this.startDate = Utils.dateFormatForApi(this.startDate);
					console.log(this.birthDate);
					const user = {
						firstName: this.ad,
						lastName: this.soyad,
						tck: this.tc,
						birthDate: this.birthDate,
						sgkStartDate: this.startDate,
						email: this.email,
						aciladsoyad: this.acilAdSoyad,
						acilyakinlik: this.acilYakinlik,
						acilno: this.acilNo,
						adres: this.acikAdres,
						myb: this.mybelgesi,
						phone2: this.cep,
						city: this.dogIl,
						district: this.dogIlce,
						mezunkurum: this.mezunKurum,
						mezunbolum: this.mezunBolum,
						iban: this.iban,
						emekli: this.emekli,
						engelli: this.engelli,
						escalisma: this.escalisma,
						tcv: this.tcv,
						muaf: this.muaf,
						kan: this.kangrubu,
						aciklama: this.aciklamaAlani,
					};
					this.http.put(url + `?unvan=${this.selectedUnvanId}&sgkSirket=${this.selectedInsuranceCompanyId}&sirket=${this.selectedSirketId}
					&egitim=${this.selectedEgitimId}&askerlik=${this.selectedAskerlikId}&cinsiyet=${this.selectedCinsiyetId}&ehliyet=${this.selectedEhliyetId}&birim=${this.selectedBirimId}&whiteCollar=${this.whiteCollar}` , user, {headers: httpHeaders, responseType: 'text'}).subscribe(
						(res: any) => {
								if (res === 'Kayıt Başarılı') {
									this.dialogRef.close();
									Utils.showActionNotification(res, 'success', 10000, true, false, 3000, this.snackBar);
								} else {
									Utils.showActionNotification(res, 'success', 10000, true, false, 3000, this.snackBar);
								}
							},
						(error) => {
							// HTTP isteği tamamen başarısız oldu
							console.error('Hata:', error);
							Utils.showActionNotification('İşlem yapılırken bir hata oluştu.', 'error', 10000, true, false, 3000, this.snackBar);
						}
					);
				}
			});
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
			this.egitimList = res.body.filter(hld => hld.attribute.id === 'Egitim_Durumlari');
			this.askerlikList = res.body.filter(hld => hld.attribute.id === 'Askerlik_Durumlari');
			this.cinsiyetList = res.body.filter(hld => hld.attribute.id === 'Cinsiyetler');
			this.ehliyetList = res.body.filter(hld => hld.attribute.id === 'Ehliyet_Siniflari');
			this.birimList = res.body.filter(hld => hld.attribute.id === 'Birimler');
			this.sirketList = res.body.filter(hld => hld.attribute.id === 'Sirketler');
			this.cdr.markForCheck();
		});
		const filters2 = new Set();
		const queryParams2 = new QueryParamsModel(
			Utils.makeFilter(filters2),
			[{sortBy: 'name', sortOrder: 'ASC'}],
			0,
			100
		);
		this.baseService.find(queryParams2, 'insurance_companies').subscribe(res => {
			this.insuranceCompanyList = res.body;
			console.log(this.insuranceCompanyList);
			this.cdr.markForCheck();
		});
	}
}
