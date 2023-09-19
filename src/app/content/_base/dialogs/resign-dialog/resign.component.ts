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
	templateUrl: 'resign.component.html',
})
export class ResignComponent implements OnInit {
	@Input() current: any;
	@Input() model: any;
	attrList = [];
	aciklama1 = '';
	aciklama2 = '';
	aciklama3 = '';
	aciklama4 = '';
	aciklama5 = '';
	aciklama6 = '';
	aciklama7 = '';
	aciklama8 = '';
	aciklama9 = '';
	oneritavsiye = '';
	ayrilmaNedeni = '';
	isDetayliIletildi = false;
	isOzlukHaklariIletildi = false;
	isIleriDusunur = false;
	isSirketOneri = false;
	isEsitDavranma = false;
	selectedSorumlulukId: any;
	selectedCalismaSaatId: any;
	selectedCalismaOrtamId: any;
	selectedOdemeSartlariId: any;
	selectedTakdirId: any;
	selectedKendiniGelistirmeId: any;
	selectedYoneticiId: any;
	selectedKariyerId: any;
	selectedSirketIciId: any;

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
		const url = '/api/resigns/saveAnket';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const entity = {
			owner : this.baseService.getUser(),
			assigner : null,
			isIletildiMi : this.isDetayliIletildi,
			ozlukHaklari : this.isOzlukHaklariIletildi,
			ilerideCalismak : this.isIleriDusunur,
			esitAdil : this.isEsitDavranma,
			sirketOneri : this.isSirketOneri,
			ayrilmaNedeni : this.ayrilmaNedeni,
			oneriTavsiye : this.oneritavsiye,
			sorumlulukYorumu : this.aciklama1,
			calismaSaatYorumu : this.aciklama2,
			calismaOrtamYorumu : this.aciklama3,
			odemeYorumu : this.aciklama4,
			takdirYorumu : this.aciklama5,
			gelistirmeYorumu : this.aciklama6,
			iliskiYorumu : this.aciklama7,
			kariyerYorumu : this.aciklama8,
			iletisimYorumu : this.aciklama9
		};
		this.http.put(url + `?sorumluluk=${this.selectedSorumlulukId}&calismaSaat=${this.selectedCalismaSaatId}&calismaOrtam=${this.selectedCalismaOrtamId}
		&odeme=${this.selectedOdemeSartlariId}&takdir=${this.selectedTakdirId}&gelistirme=${this.selectedKendiniGelistirmeId}&iliski=${this.selectedYoneticiId}
		&kariyer=${this.selectedKariyerId}&iletisim=${this.selectedSirketIciId}` , entity, {headers: httpHeaders}).subscribe(
			() => {
				this.dialogRef.close();
			},
			(error) => {
				console.error('Hata:', error);
				Utils.showActionNotification('İşlem yapılırken bir hata oluştu.', 'error', 10000, true, false, 3000, this.snackBar);
			}
		);
		console.log(entity);
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
			this.attrList = res.body.filter(hld => hld.attribute.id === 'Resign_List');
			this.cdr.markForCheck();
		});
	}
}
