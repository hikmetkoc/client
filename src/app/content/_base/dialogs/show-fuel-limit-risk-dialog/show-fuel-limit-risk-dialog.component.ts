import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {HttpUtilsService} from "../../http-utils.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
	selector: 'kt-show-fuel-limit-risk-dialog',
	templateUrl: 'show-fuel-limit-risk-dialog.component.html',
})
export class ShowFuelLimitRiskDialogComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	riskDetay = [];
	toplamLimit = 0;
	cariUnvani = '';

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

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.riskControl();
	}

	riskControl() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const curcode = this.current.curcode;
		const servisSifre = '14ADa23.';
		const firmaKodu = 875257;
		const cariKodu = curcode;
		const apiUrl = `https://srv.nccpetrol.com/DisServis/riskdetayget?ServisSifre=${servisSifre}&CariKodu=${cariKodu}&FirmaKodu=${firmaKodu}`;
		this.http.get(apiUrl, { headers: httpHeaders, responseType: 'json' })
			.subscribe(
				(response) => {
					const responseLen =  Object.keys(response).length;
					console.log('API Cevabı:', response);
					for ( let i = 0; i < responseLen; i++) {
						//console.log('RES Cevabı:', response[i].CariUnvan + ' - ' + response[i].KullanilabilirLimit + ' - ' + response[i].BankaAdi + ' - ' + response[i].NakitRisk);
						this.riskDetay.push({
							cariUnvan : response[i].CariUnvan,
							dbsLimit : response[i].DbsLimit,
							onayliFatura : response[i].OnayliFatura,
							limit : response[i].KullanilabilirLimit,
							bankaAdi : response[i].BankaAdi,
							nakitRisk : response[i].DbsLimit - response[i].OnayliFatura - response[i].BankadanGelenKullanilabilirLimit,
						});
						//this.toplamLimit += this.riskDetay[i].limit;
						this.toplamLimit = this.riskDetay[0].limit;
						this.cariUnvani = this.riskDetay[0].cariUnvan;
					}
					//limit : response[i].DbsLimit - response[i].NakitRisk - response[i].OnayliFatura,
				},
				(error) => {
					Utils.showActionNotification(error.toString(), 'success', 10000, true, false, 3000, this.snackBar);
				}
			);
	}

	formatAmount(amount) {
		// Amount'u yerel para birimi biçimine dönüştür
		return Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
	}
	formatDate(date: string): string {
		if (!date) return '';

		const formattedDate = new Date(date);
		const day = ('0' + formattedDate.getDate()).slice(-2);
		const month = ('0' + (formattedDate.getMonth() + 1)).slice(-2);
		const year = formattedDate.getFullYear();
		const hour = ('0' + formattedDate.getHours()).slice(-2);
		const minute = ('0' + formattedDate.getMinutes()).slice(-2);

		return `${day}-${month}-${year} ${hour}:${minute}`;
	}
}
