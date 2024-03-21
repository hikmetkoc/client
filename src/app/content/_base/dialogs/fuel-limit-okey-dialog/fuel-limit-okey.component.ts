import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";
import {HttpClient} from "@angular/common/http";
import {HttpUtilsService} from "../../http-utils.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FilterOperation} from "../../models/filter";

@Component({
	selector: 'kt-payment-okey',
	templateUrl: 'fuel-limit-okey.component.html',
})
export class FuelLimitOkeyComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	description: any;
	islem = false;
	riskList = [];
	riskDetay = [];
	toplamLimit = 0;
	cariUnvani = '';
	startDate: any;
	endDate: any;

	constructor(
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		public dialog: MatDialog,
		public baseService: BaseService,
		public snackBar: MatSnackBar,
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
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
		this.riskControl();
		this.getFuelLimits();
		this.startDate = new Date(this.current.startDate);
		this.endDate = new Date(this.current.endDate);
	}

	onCancelClick() {
		this.dialogRef.close('cancel');
	}

	onNoClick() {
		this.islem = true;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = this.current.id;
		const status = 'Fuel_Dur_Red';
		const unvan = this.riskDetay[0].cariUnvan;
		const totalTl = this.riskDetay[0].limit;
		const startDate1 = new Date(this.startDate);
		const endDate1 = new Date(this.endDate);
		const startDate = this.formatDate(startDate1);
		const endDate = this.formatDate(endDate1);
		console.log(unvan + ' - ' + totalTl);
		const url = `api/fuellimits/updateStatus?id=${id}&status=${status}&unvan=${unvan}&totalTl=${totalTl}&startDate=${startDate.toString()}&endDate=${endDate.toString()}`;
		// PUT isteği gönderme
		this.http.put(url, null, { headers: httpHeaders})
			.subscribe(
				() => {
					this.addRisk();
					this.dialogRef.close('no');
				},
				(error) => {
					console.error('Hata:', error);
				}
			);
	}

	onYesClick() {
		this.islem = true;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const fuelTl = Number(this.current.fuelTl);
		const curcode = this.current.curcode;
		const description = this.current.description;
		const startDate1 = new Date(this.startDate);
		const endDate1 = new Date(this.endDate);
		const startDate = this.formatDate(startDate1);
		const endDate = this.formatDate(endDate1);

		const servisSifre = '14ADa23.';
		const firmaKodu = 875257;
		const kullaniciId = 47468;
		const cariKodu = curcode;
		const apiUrl = `https://srv.meteorpetrol.com/DisServis/limitguncelle?FirmaKodu=${firmaKodu}ServisSifre=${servisSifre}&KullaniciId=${kullaniciId}`;
		const requestBody = {
			ServisSifre : '14ADa23.',
			FirmaKodu : 875257,
			KullaniciId : 47468,
			CariKodu : curcode,
			EkLimitTutar : fuelTl,
			EkLimitAciklama : description,
			BaslangicTarihi : startDate,
			BitisTarihi : endDate
		};
		this.http.post(apiUrl, requestBody, { headers: httpHeaders })
			.subscribe(
				(response) => {
					console.log('API Cevabı:', response);
					const apidescription = response['Description'] || 'Bir sorun ile karşılaşıldı, lütfen girdiğiniz Cari Kodunu kontrol edin veya Ferit Bey ile iletişime geçiniz!';
					Utils.showActionNotification(apidescription, 'success', 10000, true, false, 3000, this.snackBar);
					const id = this.current.id;
					const status = 'Fuel_Dur_Onay';
					const unvan = this.riskDetay[0].cariUnvan;
					const totalTl = this.riskDetay[0].limit;
					const url = `api/fuellimits/updateStatus?id=${id}&status=${status}&unvan=${unvan}&totalTl=${totalTl}&startDate=${startDate.toString()}&endDate=${endDate.toString()}`;
					// PUT isteği gönderme
					this.http.put(url, null, { headers: httpHeaders})
						.subscribe(
							() => {
								this.addRisk();
								this.dialogRef.close('yes');
							},
							(error) => {
								console.error('Hata:', error);
							}
						);
				},
				(error) => {
					Utils.showActionNotification(error.toString(), 'success', 10000, true, false, 3000, this.snackBar);
				}
			);
	}
	formatDate (date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
	formatDate2(date: string): string {
		if (!date) return '';

		const formattedDate = new Date(date);
		const day = ('0' + formattedDate.getDate()).slice(-2);
		const month = ('0' + (formattedDate.getMonth() + 1)).slice(-2);
		const year = formattedDate.getFullYear();

		return `${day}-${month}-${year}`;
	}
	closeClick() {
		this.dialogRef.close();
	}
	getFuelLimits() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{sortBy: 'createdDate', sortOrder: 'DESC'}],
			0,
			1000
		);
		this.baseService.find(queryParams, 'fuellimits').subscribe(res => {
			this.riskList = [];
			for (const ivl of res.body) {
				if (ivl.curcode !== this.current.curcode || this.riskList.length > 14) {
					continue;
				}
				this.riskList.push({
					createdDate: ivl.createdDate,
					owner: ivl.owner.firstName + ' ' + ivl.owner.lastName,
					assigner: ivl.assigner.firstName + ' ' + ivl.assigner.lastName,
					status: ivl.status.label,
					okeyFirst: ivl.okeyFirst,
					startDate: ivl.startDate,
					endDate: ivl.endDate,
					fuelTl: ivl.fuelTl,
					description: ivl.description
				});
			}
			console.log(this.riskList);
		});
		this.cdr.markForCheck();
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
	riskControl() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const curcode = this.current.curcode;
		const servisSifre = '14ADa23.';
		const firmaKodu = 875257;
		const cariKodu = curcode;
		const apiUrl = `https://srv.meteorpetrol.com/disservis/riskdetaygetLog?ServisSifre=${servisSifre}&CariKodu=${cariKodu}&FirmaKodu=${firmaKodu}`;
		this.http.get(apiUrl, { headers: httpHeaders, responseType: 'json' })
			.subscribe(
				(response) => {
					const responseLen =  Object.keys(response).length;
					for ( let i = 0; i < responseLen; i++) {
						this.riskDetay.push({
							cariUnvan : response[i].CariUnvan,
							dbsLimit : response[i].DbsLimit,
							onayliFatura : response[i].OnayliFatura,
							limit : response[i].KullanilabilirLimit,
							bankaAdi : response[i].BankaAdi,
							nakitRisk : response[i].BankaAdi === 'GARANTİ BANKASI' || response[i].BankaAdi === 'ING BANK' ?
								response[i].DbsLimit - response[i].OnayliFatura - response[i].BankadanGelenKullanilabilirLimit : response[i].NakitRisk,
						});
						console.log('APİİİİİİİİİİİİİİİİ' + this.riskDetay.length);
						this.toplamLimit = this.riskDetay[0].limit;
						this.cariUnvani = this.riskDetay[0].cariUnvan;
					}
				},
				(error) => {
					Utils.showActionNotification(error.toString(), 'success', 10000, true, false, 3000, this.snackBar);
				}
			);
	}

	addRisk() {
		for (let i = 0; i <= this.riskDetay.length - 1; i++) {
			const url = '/api/fuel_risks/addRisk';
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const limitId = this.current.id;
			const fuelRisk = {
				bank: this.riskDetay[i].bankaAdi,
				dbs: this.riskDetay[i].dbsLimit,
				onayli: this.riskDetay[i].onayliFatura,
				nakit: this.riskDetay[i].nakitRisk,
			};

			this.http.put(url + `?limitId=${limitId}` ,
				fuelRisk, {headers: httpHeaders, responseType: 'text'}).subscribe(
				(res: any) => {
				},
				(error) => {
					// HTTP isteği tamamen başarısız oldu
					console.error('Hata:', error);
					Utils.showActionNotification('İşlem yapılırken bir hata oluştu.', 'error', 10000, true, false, 3000, this.snackBar);
				}
			);
		}
	}
}
