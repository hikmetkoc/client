import {
	Component,
	ChangeDetectionStrategy,
	Input,
	ViewChild,
	ElementRef,
	Output,
	EventEmitter,
	AfterViewInit,
	ViewEncapsulation,
	ChangeDetectorRef
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSnackBar, MatDialog, MatSort, MatBottomSheet } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseDataSource } from '../base.datasource';
import { FilterDialogComponent } from '../dialogs/filter-dialog/filter-dialog.component';
import { LayoutSaveDialogComponent } from '../dialogs/filter-save-dialog/filter-save-dialog.component';
import { BaseService } from '../base.service';
import { Utils } from '../utils';
import { EditEntityDialogComponent } from '../dialogs/edit-entity-dialog/edit-entity-dialog.component';
import { QueryParamsModel } from '../models/query-params.model';
import { UpdateStatusDialogComponent } from '../dialogs/update-status-dialog/update-status-dialog.component';
import { DeleteEntityDialogComponent } from '../dialogs/delete-entity-dialog/delete-entity-dialog.component';
import {merge, Observable} from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {Filter, FilterOperation} from '../models/filter';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { HttpUtilsService } from '../http-utils.service';
import { DeleteConfirmComponent } from '../dialogs/delete-confirmation/delete-confirm.component';
import { LayoutShareDialogComponent } from '../dialogs/layout-share-dialog/layout-share-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { Math } from 'core-js';
import { StoreDialogComponent } from '../dialogs/store-dialog/store-dialog.component';
import {FileManagerDialogComponent} from '../detail/filemanager/file-manager-dialog/file-manager-dialog.component';
import {FileManagerToolComponent} from '../detail/filemanager/filemanagertool/filemanagertool.component';
import {SendInvoiceComponent} from '../dialogs/send-invoice-dialog/send-invoice.component';
import {errorObject} from 'rxjs/internal-compatibility';
import {
	PaymentOrderFileDialogComponent
} from '../dialogs/payment-order-file-dialog/payment-order-file-dialog.component';
import {
	PaymentOrderInfoDialogComponent
} from '../dialogs/payment-order-info-dialog/payment-order-info-dialog.component';
import {User} from '../../../core/auth';
import {SendSpendComponent} from '../dialogs/send-spend-dialog/send-spend.component';
import {SpendToTlComponent} from '../dialogs/spend-to-tl-dialog/spend-to-tl.component';
import {ConnectStoreDialogComponent} from '../dialogs/connect-store-dialog/connect-store-dialog.component';
import {SpendOkeyComponent} from '../dialogs/spend-okey-dialog/spend-okey.component';
import {PaymentOkeyComponent} from '../dialogs/payment-okey-dialog/payment-okey.component';
import {reportInvalidActions} from '@ngrx/effects/src/effect_notification';
import {ChangeRoleComponent} from '../dialogs/change-role-dialog/change-role.component';
import {ChangeGroupComponent} from '../dialogs/change-group-dialog/change-group.component';
import {
	ReportManagerDialogComponent
} from '../detail/reportmanager/report-manager-dialog/report-manager-dialog.component';
import {ResignComponent} from '../dialogs/resign-dialog/resign.component';
import {NewPersonComponent} from '../dialogs/new-person-dialog/new-person.component';
import {ShowPersonelContractComponent} from '../detail/show-personel-contract-dialog/show-personel-contract.component';
import {SpendInfoDialogComponent} from '../dialogs/spend-info-dialog/spend-info-dialog.component';
import {
	ShowFuelLimitRiskDialogComponent
} from '../dialogs/show-fuel-limit-risk-dialog/show-fuel-limit-risk-dialog.component';
import {Base64FileDialogComponent} from "../dialogs/base64-file-dialog/base64-file-dialog.component";
import {FuelLimitOkeyComponent} from "../dialogs/fuel-limit-okey-dialog/fuel-limit-okey.component";

@Component({
	selector: 'kt-grid',
	templateUrl: './grid.component.html',
	styleUrls: ['./grid.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
	encapsulation: ViewEncapsulation.None
})
export class GridComponent implements AfterViewInit {

	@Input() entity;
	@Input() mode = 'Standard'; // Standard, Compact
	@Input() defaultFilter = [];
	@Input() defaultValues = [];
	@Input() extraButtons = [];
	@Input() readOnly: boolean;
	@Input() defaultSort = [{sortOrder: 'DESC', sortBy: 'createdDate'}];
	@Input() buttons = [];
	@Input() title;
	@Input() data;
	@Input() url;
	@Input() owner: 'ALL' | 'HIERARCHY_D' = 'ALL';
	@Input() assigner: 'ALL' | 'HIERARCHY_D' = 'ALL';
	@Input() other: 'ALL' | 'HIERARCHY_D' = 'ALL';
	@Input() showButtons = false;

	@Output() rowClick = new EventEmitter<boolean>();
	@Output() change = new EventEmitter<any>();
	@Output() loadComplete = new EventEmitter<any>();

	@ViewChild(MatPaginator, undefined) paginator: MatPaginator;
	@ViewChild(MatSort, undefined) sort: MatSort;
	color = 'warning';
	layout: { my: boolean; filterItems: any[]; assigner; owner; other; sort: { sortOrder: string; sortBy: string; }[]; } = {
		filterItems: [],
		my: true,
		sort: [],
		owner: 'ALL',
		assigner: 'ALL',
		other: 'ALL'
	};
	activeFilter: any = 'All';
	mapTranslate: Map<string, string>;
	searchStr: string;
	actions: string;
	displayedColumns = [];
	filterColumns = [];
	exportColumns = [];
	filters: any = [];
	dataSource: BaseDataSource;
	selection = new SelectionModel<any>(true, []);
	result: any[] = [];
	model;
	checked;
	dataSourceType;
	utils;
	filteredOptionss = {};
	timer: any;
	storebuyownerid;
	tablo: any;
	kalanizin: any;
	kullanilanizin: any;
	toplamtlodeme: any;
	toplamdlodeme: any;
	mpetroltlodeme: any;
	mpetroldlodeme: any;
	terminaltlodeme: any;
	terminaldlodeme: any;
	minsaattlodeme: any;
	minsaatdlodeme: any;
	cpetroltlodeme: any;
	cpetroldlodeme: any;
	npetroltlodeme: any;
	npetroldlodeme: any;
	izmirsubetlodeme: any;
	izmirsubedlodeme: any;
	igdirsubetlodeme: any;
	igdirsubedlodeme: any;
	simyatlodeme: any;
	simyadlodeme: any;
	bircetlodeme: any;
	bircedlodeme: any;
	mudanyatlodeme: any;
	mudanyadlodeme: any;
	startlodeme: any;
	stardlodeme: any;
	chargetlodeme: any;
	chargedlodeme: any;
	avelicetlodeme: any;
	avelicedlodeme: any;
	izinbul = [];
	loading: boolean;
	odemeYapanSirket: any;
	talimatOnayDurumu: any;
	isButtonClicked = false;
	isSecondButtonClicked = false;
	gnlMudurOnayList = [];
	isFilterOpen = false;
	maliyetYeri: any;
	hareketlerTedarikci: any;
	hareketlerUstCari: any;
	hareketlerList = [];
	hareketlerUstCariList = [];

	constructor(
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public baseService: BaseService,
		private bottomSheet: MatBottomSheet,
		public route: ActivatedRoute
	) {
		this.utils = Utils;
		this.storebuyownerid = 0;
	}

	ngAfterViewInit() {
		this.model = Utils.getModel(this.entity);
		this.displayColumns();
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadList();
				})
			)
			.subscribe();

		this.dataSource = new BaseDataSource(this.baseService);
		if (this.url) {
			this.dataSource.url = this.url;
		} else {
			this.dataSource.url = this.model.apiName;
		}
		this.route.queryParams.subscribe(params => {
			if (params.filter === undefined) {
				this.loadList();
			}
		});
		this.getFilters();
		this.tablo = this.model.apiName;
	}

	toggleFilter() {
		this.isFilterOpen = !this.isFilterOpen;
	}
	onayListClick() {
		if (this.isButtonClicked) {
			this.isButtonClicked = false;
		} else {
			this.isButtonClicked = true;
		}
		this.loadList();
	}
	onayList2Click() {
		if (this.isSecondButtonClicked) {
			this.isSecondButtonClicked = false;
		} else {
			this.isSecondButtonClicked = true;
		}
		this.loadList();
	}
	getBehaviorList() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{sortBy: 'createdDate', sortOrder: 'ASC'}],
			0,
			10000
		);
		this.baseService.find(queryParams, 'motionsumss').subscribe(res => {
			this.hareketlerList = res.body.map( flt => flt.customer);
			for (let a = 0; a <= this.hareketlerList.length - 1; a++) {
				for (let b = 0; a <= this.hareketlerList.length - 1; b++) {
					if (this.hareketlerList[a].id === this.hareketlerList[b].id ) {
						this.hareketlerList.splice(a,1);
					}
				}
			}
			this.cdr.markForCheck();
		});
	}
	getBehaviorUstList() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{sortBy: 'createdDate', sortOrder: 'ASC'}],
			0,
			10000
		);
		this.baseService.find(queryParams, 'motionsumss').subscribe(res => {
			this.hareketlerUstCariList = res.body.map( flt => flt.parent);
			for (let a = 0; a <= this.hareketlerUstCariList.length - 1; a++) {
				for (let b = 0; a <= this.hareketlerUstCariList.length - 1; b++) {
					if (this.hareketlerUstCariList[a].id === this.hareketlerUstCariList[b].id ) {
						this.hareketlerUstCariList.splice(a,1);
					}
				}
			}
			this.cdr.markForCheck();
		});
	}
	async loadList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel();
		if (this.model.name === 'PaymentOrder') {
			queryParams.sorts = this.sort.direction && this.sort.active ? [{
				sortOrder: this.sort.direction.toUpperCase(),
				sortBy: this.sort.active
			}] : this.defaultSort,
				queryParams.page = this.paginator.pageIndex;
		} else {
			queryParams.sorts = this.sort.direction && this.sort.active ? [{
				sortOrder: this.sort.direction.toUpperCase(),
				sortBy: this.sort.active
			}] : this.defaultSort,
				queryParams.page = this.paginator.pageIndex;
		}
		queryParams.size = this.paginator.pageSize;
		const filters = new Set();
		if (this.mode === 'Standard') {
			this.addFilterColumns(filters);
		}
		for (let f of this.defaultFilter) {
			filters.add(f);
		}
		// SAYFA FİLTRELERİ
		if (this.model.name === 'User') {
			if (this.baseService.getUserId() !== 2) {
				filters.add({
					name: 'activated',
					operator: FilterOperation.EQUALS,
					value: true
				});
			}
			if (this.baseService.getUserId() === 2001) {
				filters.add({
					name: 'birim',
					operator: FilterOperation.IN,
					value: ['Birimler_Loher', 'Birimler_Muh']
				});
			}
			if (this.baseService.getUser().birim.id === 'Birimler_Fin') {
				filters.add({
					name: 'birim',
					operator: FilterOperation.EQUALS,
					value: 'Birimler_Fin'
				});
			}
			if (this.baseService.getUser().birim.id === 'Birimler_Muh') {
				filters.add({
					name: 'id',
					operator: FilterOperation.EQUALS,
					value: this.baseService.getUser().id
				});
			}
			if ((this.baseService.getUser().birim.id === 'Birimler_Loher' || this.baseService.getUser().birim.id === 'Birimler_Avelice' || this.baseService.getUser().birim.id === 'Birimler_SanSat') && this.baseService.getUser().unvan.id === 'Unvanlar_Muh_Uzm') {
				filters.add({
					name: 'id',
					operator: FilterOperation.EQUALS,
					value: this.baseService.getUser().id
				});
			}
		}
		if (this.model.name === 'InvoiceList') {
			if (this.baseService.getUser().unvan.id === 'Unvanlar_Gen_Mud') {
				filters.add({
					name: 'owner.id',
					operator: FilterOperation.EQUALS,
					value: this.baseService.getUserId()
				});
			}
			if (this.baseService.getUser().birim.id === 'Birimler_Fin') {
				filters.add({
					name: 'owner',
					operator: FilterOperation.EQUALS,
					value: this.baseService.getUserId()
				});
			}
			if (this.baseService.getUserId() === 29600) {	// Selin AKBAYIRLI => Kendisinin, Elif Küçükkurt ve Ece Önver'in girdiği faturaları görebilsin.
				filters.add({
					name: 'owner.id',
					operator: FilterOperation.IN,
					value: [this.baseService.getUserId(), 134, 40100]
				});
			}
			if (this.baseService.getUserId() === 134 || this.baseService.getUserId() === 40100) {	// Elif Küçükkurt ve Eve Önver sadece kendisine atanan faturaları görebilsin.
				filters.add({
					name: 'owner.id',
					operator: FilterOperation.EQUALS,
					value: this.baseService.getUserId()
				});
			}
			if (this.baseService.getUserId() === 133) {	// Mustafa ÖCAL, Birimi Avelice olan fatura atanmış kişilerin tüm faturalarını görebilsin.
				filters.add({
					name: 'owner.birim.id',
					operator: FilterOperation.EQUALS,
					value: 'Birimler_Avelice'
				});
			}
			if (this.baseService.getUser().unvan.id === 'Unvanlar_San_Bas_Yrd' || this.baseService.getUser().unvan.id === 'Unvanlar_San_Bas') {
				filters.add({	// Mustafa Karaman ve Zafer Aydın; Fatura atanmış kişilerin birimleri Löher veya Avelice ise görebilsin.
					name: 'owner.birim.id',
					operator: FilterOperation.IN,
					value: ['Birimler_Loher', 'Birimler_Avelice']
				});
			}
		}
		if (this.model.name === 'PaymentOrder') {
			if (this.isButtonClicked) {
				filters.add({
					name: 'assigner.id',
					operator: FilterOperation.EQUALS,
					value: this.baseService.getUserId()
				});
				filters.add({
					name: 'status.id',
					operator: FilterOperation.EQUALS,
					value: 'Payment_Status_Bek1'
				});
			}
			if (this.isSecondButtonClicked) {
				filters.add({
					name: 'secondAssigner.id',
					operator: FilterOperation.EQUALS,
					value: this.baseService.getUserId()
				});
				filters.add({
					name: 'status.id',
					operator: FilterOperation.EQUALS,
					value: 'Payment_Status_Bek2'
				});
			}
			if (this.baseService.getUser().birim.id === 'Birimler_Muh' && this.baseService.getUserId() !== 71) {	// Serpil Hanım hariç Merkez Muhasebe Görüntüsü
				filters.add({
					name: 'muhasebeGoruntusu',
					operator: FilterOperation.EQUALS,
					value: true
				});
				filters.add({
					name: 'cost',
					operator: FilterOperation.IN,
					value: ['Cost_Place_MeteorMerkez' , 'Cost_Place_Terminal' , 'Cost_Place_Mudanya' ,
						'Cost_Place_Ncc' , 'Cost_Place_Cemcan' , 'Cost_Place_Birce' , 'Cost_Place_Simya' ,
						'Cost_Place_Vitalyum' , 'Cost_Place_Vita' , 'Cost_Place_Tepe' , 'Cost_Place_Samanli' ,
						'Cost_Place_Ciftlikkoy' , 'Cost_Place_Sarj' , 'Cost_Place_Charge' , 'Cost_Place_Otobil']
				});
			}
			if (this.baseService.getUserId() === 71) { // Serpil TÜRKOĞLU ; Saha Primi hariç tüm talimatları görebilsin.
				filters.add({
					name: 'paymentSubject',
					operator: FilterOperation.IN,
					value: ['Payment_Sub_Avans' , 'Payment_Sub_BES' , 'Payment_Sub_Cihaz' ,
						'Payment_Sub_Diger' , 'Payment_Sub_Fatura' , 'Payment_Sub_Iade' , 'Payment_Sub_Icra' ,
						'Payment_Sub_Kargo' , 'Payment_Sub_Masraf' , 'Payment_Sub_On' , 'Payment_Sub_Personel' ,
						'Payment_Sub_Prim' , 'Payment_Sub_Sehven' , 'Payment_Sub_Seyehat' , 'Payment_Sub_Sigorta' , 'Payment_Sub_Tra', 'Payment_Sub_Acik']
				});
			}
			if (this.baseService.getUser().unvan.id === 'Unvanlar_San_Bas_Yrd' || this.baseService.getUser().unvan.id === 'Unvanlar_San_Bas') {
				filters.add({
					name: 'cost',
					operator: FilterOperation.IN,
					value: ['Cost_Place_Avelice', 'Cost_Place_MeteorIgdir', 'Cost_Place_MeteorIzmir']
				});
			}
			if (this.baseService.getUser().birim.id === 'Birimler_Loher' && this.baseService.getUser().unvan.id === 'Unvanlar_Muh_Uzm') {
				filters.add({
					name: 'cost',
					operator: FilterOperation.EQUALS,
					value: 'Cost_Place_MeteorIzmir'
				});
			}
			if (this.baseService.getUser().birim.id === 'Birimler_Avelice') {
				filters.add({
					name: 'cost',
					operator: FilterOperation.IN,
					value: ['Cost_Place_Avelice', 'Cost_Place_MeteorIgdir']
				});
			}
			if (this.baseService.getUser().birim.id === 'Birimler_SanSat') {
				filters.add({
					name: 'cost',
					operator: FilterOperation.IN,
					value: ['Cost_Place_Avelice', 'Cost_Place_MeteorIgdir']
				});
			}
			if (this.baseService.getUser().unvan.id === 'Unvanlar_Gen_Mud') {
				this.gnlMudurOnayList = [];
				const filters2 = new Set();
				const queryParams2 = new QueryParamsModel(
					Utils.makeFilter(filters2),
					[{sortBy: 'createdDate', sortOrder: 'DESC'}],
					0,
					5000
				);
				this.baseService.find(queryParams2, 'payment_orders').subscribe(res => {
					this.gnlMudurOnayList = res.body
						.filter(gnl => (gnl.assigner.id === 99 && gnl.status.id === 'Payment_Status_Bek1')
							|| (gnl.secondAssigner.id === 99 && gnl.status.id === 'Payment_Status_Bek2'))
						.map(gnl => gnl.id);
					if (this.gnlMudurOnayList.length === 0) {
						this.gnlMudurOnayList[0].id = 'b55f76bf-7a0b-4675-9142-64e46c000000';
					}
					filters.add({
						name: 'id',
						operator: FilterOperation.IN,
						value: this.gnlMudurOnayList
					});
					queryParams.filter = Utils.makeFilter(filters);
					queryParams.owner = this.owner;
					queryParams.assigner = this.assigner;
					queryParams.other = this.other;
					queryParams.search = this.searchStr;
					this.dataSource.load(queryParams);
					// tslint:disable-next-line:no-shadowed-variable
					this.dataSource.entitySubject.subscribe(res => {
						if (JSON.stringify(this.result) !== JSON.stringify(res)) {
							this.result = res;
							this.loadComplete.emit(res);
						}
					});
					this.cdr.markForCheck();
				});
			}
		}
		if (this.model.name === 'Spend') {
			if (this.odemeYapanSirket !== undefined) {
				filters.add({
					name: 'paymentorder.odemeYapanSirket',
					operator: FilterOperation.EQUALS,
					value: this.odemeYapanSirket
				});
			}
			if (this.talimatOnayDurumu !== undefined) {
				filters.add({
					name: 'paymentorder.status.id',
					operator: FilterOperation.EQUALS,
					value: this.talimatOnayDurumu
				});
			}
			if (this.baseService.getUser().birim.id === 'Birimler_Fin') {
				await this.odemelerBul();
				filters.add({
					name: 'finance',
					operator: FilterOperation.EQUALS,
					value: 1
				});
				/*filters.add({
					name: 'paymentStatus',
					operator: FilterOperation.IN,
					value: ['Onaylandı', 'Kısmi Ödendi', 'Ödendi', 'Reddedildi']
				});*/
			}
			if (this.baseService.getUser().birim.id === 'Birimler_Avelice') {
				filters.add({
					name: 'paymentorder.cost',
					operator: FilterOperation.IN,
					value: ['Cost_Place_MeteorIgdir', 'Cost_Place_Avelice']
				});
			}
			if (this.baseService.getUser().birim.id === 'Birimler_SanSat') {
				filters.add({
					name: 'paymentorder.cost',
					operator: FilterOperation.IN,
					value: ['Cost_Place_MeteorIgdir', 'Cost_Place_Avelice']
				});
			}
			if (this.baseService.getUser().birim.id === 'Birimler_Loher' && this.baseService.getUser().unvan.id !== 'Unvanlar_San_Bas_Yrd') {
				filters.add({
					name: 'paymentorder.cost',
					operator: FilterOperation.EQUALS,
					value: 'Cost_Place_MeteorIzmir'
				});
			}
			if (this.baseService.getUser().unvan.id === 'Unvanlar_San_Bas_Yrd' || this.baseService.getUser().unvan.id === 'Unvanlar_San_Bas') {
				filters.add({
					name: 'paymentorder.cost',
					operator: FilterOperation.IN,
					value: ['Cost_Place_Avelice', 'Cost_Place_MeteorIgdir', 'Cost_Place_MeteorIzmir']
				});
			}
			if (this.baseService.getUser().birim.id === 'Birimler_Muh') {
				filters.add({
					name: 'createdBy',
					operator: FilterOperation.EQUALS,
					value: 1
				});
			}
		}
		if (this.model.name === 'Behavior') {
			if (this.maliyetYeri !== undefined) {
				filters.add({
					name: 'motionsums.cost',
					operator: FilterOperation.EQUALS,
					value: this.maliyetYeri
				});
			}
			this.getBehaviorList();
			this.getBehaviorUstList();
			if (this.hareketlerTedarikci !== undefined) {
				filters.add({
					name: 'motionsums.customer.id',
					operator: FilterOperation.EQUALS,
					value: this.hareketlerTedarikci
				});
			}
			if (this.hareketlerUstCari !== undefined) {
				filters.add({
					name: 'motionsums.parent.id',
					operator: FilterOperation.EQUALS,
					value: this.hareketlerUstCari
				});
			}
		}
		if (this.model.name === 'Holiday') {
			await this.izinBul();
			if (this.baseService.getUserId() === 99) {
				filters.add({
					name: 'assigner',
					operator: FilterOperation.EQUALS,
					value: 99
				});
			}
			if (this.baseService.getUserId() === 2001) {
				filters.add({
					name: 'owner.birim',
					operator: FilterOperation.IN,
					value: ['Birimler_Loher', 'Birimler_Muh']
				});
			}
			if (this.baseService.getUser().unvan.id === 'Unvanlar_Ic_Uzm') {
				filters.add({
					name: 'user.id',
					operator: FilterOperation.EQUALS,
					value: this.baseService.getUserId()
				});
			}
		}
		if (this.model.name === 'Document') {
			if (this.baseService.getUser().unvan.id !== 'Unvanlar_Idr_Mud' && this.baseService.getUserId() !== 2000 && this.baseService.getUserId() !== 2) {
				if (this.baseService.getUser().birim.id === 'Birimler_Satin' && this.baseService.getUser().unvan.id === 'Unvanlar_Ope_Sat_Mud') {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Dokuman_Sirketleri_Meteor', 'Dokuman_Sirketleri_Cemcan', 'Dokuman_Sirketleri_Ncc', 'Dokuman_Sirketleri_Simya', 'Dokuman_Sirketleri_Genel']
					});
				} else if (this.baseService.getUser().sirket.id === 'Sirketler_Cemcan' && this.baseService.getUser().unvan.id === 'Unvanlar_Ist_Amr') {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Dokuman_Sirketleri_Cemcan', 'Dokuman_Sirketleri_Genel']
					});
				} else if (this.baseService.getUser().sirket.id === 'Sirketler_Ncc' && this.baseService.getUser().unvan.id === 'Unvanlar_Ist_On') {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Dokuman_Sirketleri_Ncc', 'Dokuman_Sirketleri_Genel']
					});
				} else if (this.baseService.getUser().birim.id === 'Birimler_Ter' && this.baseService.getUser().unvan.id === 'Unvanlar_Ist_Amr') {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Dokuman_Sirketleri_Meteor', 'Dokuman_Sirketleri_Genel']
					});
				} else if (this.baseService.getUser().birim.id === 'Birimler_Kafe' && this.baseService.getUser().unvan.id === 'Unvanlar_Isl_Mud') {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Dokuman_Sirketleri_Simya', 'Dokuman_Sirketleri_Genel']
					});
				} else if (this.baseService.getUserId() === 35750 || this.baseService.getUserId() === 14 || this.baseService.getUserId() === 18 || this.baseService.getUserId() === 94) {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Dokuman_Sirketleri_MeteorIns', 'Dokuman_Sirketleri_Genel']
					});
				} else {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.EQUALS,
						value: 'Dokuman_Sirketleri_Genel'
					});
				}
			}
		}
		if ((this.model.name === 'PaymentOrder' && this.baseService.getUser().unvan.id !== 'Unvanlar_Gen_Mud')
			|| (this.model.name !== 'PaymentOrder')) {
			queryParams.filter = Utils.makeFilter(filters);
			queryParams.owner = this.owner;
			queryParams.assigner = this.assigner;
			queryParams.other = this.other;

			queryParams.search = this.searchStr;
			this.dataSource.load(queryParams);
			this.dataSource.entitySubject.subscribe(res => {
				if (JSON.stringify(this.result) !== JSON.stringify(res)) {
					this.result = res;
					if (this.model.name === 'PaymentOrder') {
						this.result.sort((a, b) => {
							if (a.paymentSubject.id === 'Payment_Sub_Acik') {
								return -1;
							} else {
								const dateA = new Date(a.createdDate);
								const dateB = new Date(b.createdDate);
								return dateB.getTime() - dateA.getTime();
							}
						});
					}
					this.loadComplete.emit(res);
				}
			});
		}
		/*queryParams.filter = Utils.makeFilter(filters);
		queryParams.owner = this.owner;
		queryParams.assigner = this.assigner;
		queryParams.other = this.other;

		queryParams.search = this.searchStr;
		this.dataSource.load(queryParams);
		this.dataSource.entitySubject.subscribe(res => {
			if (JSON.stringify(this.result) !== JSON.stringify(res)) {
				this.result = res;
				this.loadComplete.emit(res);
			}
		});*/
	}

	roundUp(num: number): number {
		return Math.ceil(num);
	}

	izinBul() {
		this.kalanizin = 0;
		this.kullanilanizin = 0;
		const filters2 = new Set();
		filters2.add({
			name: 'user.id',
			operator: 'EQUALS',
			value: this.baseService.getUser().id
		});
		const queryParams2 = new QueryParamsModel(
			Utils.makeFilter(filters2)
		);
		this.baseService.find(queryParams2, 'holusers').subscribe(res3 => {
			this.izinbul = [];
			for (const hld of res3.body) {
				this.izinbul.push({
					kalan: hld.id
				});
				this.kalanizin = hld.kalYil;
				this.kullanilanizin = hld.kulYil + hld.topKul;
			}
			this.cdr.markForCheck();
		});
	}

	async odemelerBul() {
		const apiUrl = 'api/' + this.model.apiName + '/controltotalspends';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post(apiUrl, null, { headers: httpHeaders, responseType: 'text' }).subscribe(
			response => {
				console.log(response);
				const parts = response.split('&');
				this.mpetroltlodeme = parseFloat(parts[0].split('-')[0].replace(',', '.'));
				this.mpetroldlodeme = parseFloat(parts[0].split('-')[1].replace(',', '.'));

				this.terminaltlodeme = parseFloat(parts[1].split('-')[0].replace(',', '.'));
				this.terminaldlodeme = parseFloat(parts[1].split('-')[1].replace(',', '.'));

				this.minsaattlodeme = parseFloat(parts[2].split('-')[0].replace(',', '.'));
				this.minsaatdlodeme = parseFloat(parts[2].split('-')[1].replace(',', '.'));

				this.cpetroltlodeme = parseFloat(parts[3].split('-')[0].replace(',', '.'));
				this.cpetroldlodeme = parseFloat(parts[3].split('-')[1].replace(',', '.'));

				this.npetroltlodeme = parseFloat(parts[4].split('-')[0].replace(',', '.'));
				this.npetroldlodeme = parseFloat(parts[4].split('-')[1].replace(',', '.'));

				this.izmirsubetlodeme = parseFloat(parts[5].split('-')[0].replace(',', '.'));
				this.izmirsubedlodeme = parseFloat(parts[5].split('-')[1].replace(',', '.'));

				this.igdirsubetlodeme = parseFloat(parts[6].split('-')[0].replace(',', '.'));
				this.igdirsubedlodeme = parseFloat(parts[6].split('-')[1].replace(',', '.'));

				this.simyatlodeme = parseFloat(parts[7].split('-')[0].replace(',', '.'));
				this.simyadlodeme = parseFloat(parts[7].split('-')[1].replace(',', '.'));

				this.bircetlodeme = parseFloat(parts[8].split('-')[0].replace(',', '.'));
				this.bircedlodeme = parseFloat(parts[8].split('-')[1].replace(',', '.'));

				this.mudanyatlodeme = parseFloat(parts[9].split('-')[0].replace(',', '.'));
				this.mudanyadlodeme = parseFloat(parts[9].split('-')[1].replace(',', '.'));

				this.startlodeme = parseFloat(parts[10].split('-')[0].replace(',', '.'));
				this.stardlodeme = parseFloat(parts[10].split('-')[1].replace(',', '.'));

				this.chargetlodeme = parseFloat(parts[11].split('-')[0].replace(',', '.'));
				this.chargedlodeme = parseFloat(parts[11].split('-')[1].replace(',', '.'));

				this.avelicetlodeme = parseFloat(parts[12].split('-')[0].replace(',', '.'));
				this.avelicedlodeme = parseFloat(parts[12].split('-')[1].replace(',', '.'));
				},
			error => {
				Utils.showActionNotification('Toplama Hatası', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		);
		/*return new Promise((resolve, reject) => {
			const filters2 = new Set();
			filters2.add({
				name: 'lock',
				operator: 'EQUALS',
				value: false
			});
			const queryParams2 = new QueryParamsModel(
				Utils.makeFilter(filters2)
			);
			this.baseService.find(queryParams2, 'spends').subscribe(
				(res3) => {
					this.toplamtlodeme = 0;
					this.toplamdlodeme = 0;
					for (const hld of res3.body) {
						if (hld.status.label !== 'Ödenmedi') {
							continue;
						}
						if (hld.paymentorder.moneyType.id === 'Par_Bir_Tl') {
							this.toplamtlodeme = this.toplamtlodeme + hld.amount;
						} else if (hld.paymentorder.moneyType.id !== 'Par_Bir_Tl') {
							if (hld.paymentorder.paymentStyle.id === 'Payment_Style_Tl') {
								this.toplamtlodeme = this.toplamtlodeme + hld.payTl;
							} else {
								this.toplamdlodeme = this.toplamdlodeme + hld.amount;
							}
						}
					}
					this.cdr.markForCheck();
					resolve(); // İşlem tamamlandığında resolve çağrılır.
				},
				(error) => {
					console.error('Sorgu hatası:', error);
					reject(error); // Hata oluştuğunda reject çağrılır.
				}
			);
		});*/
	}

	rememberHoliday(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		const apiUrl = 'api/' + this.model.apiName + '/sendnotificationmail';
		const receiver = entity.assigner.eposta;
		// const receiver = 'hikmet@meteorpetrol.com';
		const subject = 'İzin Hatırlatması';
		const message = entity.owner.firstName + ' ' + entity.owner.lastName + ' kullanıcısı, yapmış olduğu bir izin talebini onaylamanız için size bir hatırlatmada bulunuyor.';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post(apiUrl + `?receiver=${receiver}&subject=${subject}&message=${message}`, null, { headers: httpHeaders, responseType: 'blob' }).subscribe(
			response => {
				Utils.showActionNotification('E-posta Gönderimi başarılı!', 'success', 10000, true, false, 3000, this.snackBar);
			},
			error => {
				Utils.showActionNotification('E-posta gönderme hatası', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		);
	}

	/*getUserList() {
		this.baseService.getUser().subscribe(
			(users: any[]) => {
				this.baseService.getUser().id = users;
			},
			(error) => {
				console.error('Kullanıcı listesi alınırken bir hata oluştu:', error);
			}
		);
	}*/
	addFilterColumns(filters) {	// Filtrelere veri girilirken yapılacak olanlar;
		for (let filterColumn of this.filterColumns) {
			switch (filterColumn.fieldType) {
				case 'time':
					if (filterColumn.value) {
						filters.add({
							name: filterColumn.name,
							operator: 'GREATER_OR_EQUAL_THAN',
							value: filterColumn.value
						});
					}
					if (filterColumn.value2) {
						filters.add({
							name: filterColumn.name,
							operator: 'LESS_THAN',
							value: filterColumn.value2
						});
					}
					break;
				case 'select':
					if (filterColumn.value) {
						filters.add({
							name: filterColumn.name + '.id',
							operator: 'EQUALS',
							value: filterColumn.value
						});
					}
					break;
				case 'object':
					if (filterColumn.value && filterColumn.value.id) {
						filters.add({
							name: filterColumn.name + '.id',
							operator: 'EQUALS',
							value: filterColumn.value.id
						});
					}
					break;
				default:
					if (filterColumn.value) {
						filters.add({
							name: filterColumn.name,
							operator: 'CONTAINS',
							value: filterColumn.value
						});
					}
					break;
			}
		}
	}

	searchChange(searchStr) {
		if (searchStr.length > 0) {
			this.searchStr = searchStr;
		} else {
			this.searchStr = undefined;
		}
		this.paginator.pageIndex = 0;
		this.loadList();
	}

	cleanFilter() {
		this.layout.filterItems = [];
		this.loadList();
	}

	deleteFilterDialog() {
		this.bottomSheet.open(DeleteConfirmComponent).afterDismissed().subscribe((doIt) => {
			if (doIt) {
				this.baseService.delete(this.activeFilter.id, 'layouts').subscribe(() => {
					this.activeFilter = 'All';
					this.cleanFilter();
					this.getFilters();
				});
			}
		});
	}

	saveLayoutDialog() {
		const dialogRef = this.dialog.open(LayoutSaveDialogComponent, {
			data: {
				layout: this.layout.filterItems,
				model: this.model
			}
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				res.objectName = this.model.name;
				res.userId = this.baseService.getUserId();
				this.layout.sort = [{
					sortOrder: this.sort.direction.toUpperCase() || 'desc',
					sortBy: this.sort.active || 'id'
				}],
					res.layout = this.layout;
				this.baseService.update(res, 'layouts').subscribe(() => {
					Utils.showActionNotification('Filtre kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
					this.getFilters();
				});
			}
		});
	}

	shareLayoutDialog() {
		if (!this.activeFilter.id) {
			Utils.showActionNotification('Filtre paylaşmak için kayıtlı bir filtre seçmiş olmalısınız.', 'warning', 3000, true, false, 3000, this.snackBar);
		}
		const dialogRef = this.dialog.open(LayoutShareDialogComponent, {
			data: {
				layout: this.layout,
				model: this.model
			}
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.baseService.update(res.userIds, 'layouts/ShareTemplate?layoutId=' + this.activeFilter.id).subscribe(() => {
					Utils.showActionNotification('Filtre paylaşıldı', 'success', 10000, true, false, 3000, this.snackBar);
				});
			}
		});
	}

	displayColumns() {
		this.displayedColumns.push('select');
		if (this.model.name === 'Spend') {
			/*this.displayedColumns.push('paymentorder1');
			this.displayedColumns.push('paymentorder2');
			this.displayedColumns.push('paymentorder3');
			this.displayedColumns.push('paymentorder4');
			this.displayedColumns.push('paymentorder5');*/
			this.displayedColumns.push('paymentorder6');
			this.displayedColumns.push('paymentorder7');
			this.displayedColumns.push('paymentorder8');
		} else if (this.model.name === 'Behavior') {
			this.displayedColumns.push('hareketlerSirket');
			this.displayedColumns.push('hareketlerTedarikci');
			this.displayedColumns.push('hareketlerMaliyet');
			/*this.displayedColumns.push('hareketlerBorc');
			this.displayedColumns.push('hareketlerAlacak');
			this.displayedColumns.push('hareketlerBakiye');*/
		}
		for (const field of this.model.fields) {
			if (field.display) {
				this.displayedColumns.push(field.name);
				this.exportColumns.push(field.name);
			}
			/*if (this.model.name === 'Spend' && field.name === 'paymentorder') {
				this.filterColumns.push('paymentorder');
			}*/
			if (field.filterable) {
				this.filterColumns.push(field);
				// todo: SPEND -> ODEME YAPAN ŞİRKET
				/*if (this.model.name === 'Task' && field.name === 'owner' && field.value === undefined) {
					field.value = this.baseService.getUser();
				}*/

				/*if (this.baseService.getUserId().toString() !== '81') {*/
				// Talep Eden Satırına Kullanıcı Adını Yazdırma
				/*if (this.model.name === 'Task' && field.name === 'assigner' && field.value === undefined) {
					field.value = this.baseService.getUser();
				}
				 */
				/*
				if (this.model.name === 'Lead' && field.name === 'status' && field.value === undefined) {
					field.value = this.baseService.getAttrVal('Müş_Dur_Yeni').id;
				} */
			}
		}
		/*if (this.model.name === 'Spend') {
			this.filterColumns.push('paymentorder');
		}*/
		if (this.showButtons && !this.readOnly) {
			this.displayedColumns.push('actions');
		}

		/*if (this.showButtons && !this.readOnly) {
			this.displayedColumns.push('approve');
			this.displayedColumns.push('reject');
		}*/
	}
	selectedRowExcelReport() {
		const selectedData = this.result;

		if (selectedData.length > 0) {
			const selectedIds = selectedData.map(row => row.id);
			this.baseService.loadingSubject.next(false);
			if (this.baseService.loadingSubject.value) { return; }
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const url = `api/${this.model.apiName}/selectedExcelReport`;
			const requestData = { ids: selectedIds };

			this.http.post(url, requestData, { headers: httpHeaders, responseType: 'blob' })
				.pipe(
					tap(res => {
						if (res) {
							Utils.downloadFile(res, 'Excel', 'Seçili Excel Raporu');
							this.baseService.loadingSubject.next(true);
						}
					}),
					catchError(err => {
						this.baseService.loadingSubject.next(false);
						return err;
					})
				).subscribe();
		}
	}

	selectedSpendExcelReport() {
		const selectedData = this.result;

		if (selectedData.length > 0) {
			const selectedIds = selectedData.map(row => row.id);
			this.baseService.loadingSubject.next(false);
			if (this.baseService.loadingSubject.value) { return; }
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const url = `api/${this.model.apiName}/selectedSpendExcelReport`;
			const requestData = { ids: selectedIds };

			this.http.post(url, requestData, { headers: httpHeaders, responseType: 'blob' })
				.pipe(
					tap(res => {
						if (res) {
							Utils.downloadFile(res, 'Excel', 'Finans Ödemeler Raporu');
							this.baseService.loadingSubject.next(true);
						}
					}),
					catchError(err => {
						this.baseService.loadingSubject.next(false);
						return err;
					})
				).subscribe();
		}
	}

	selectedRowExcelSpendReport() {
		const selectedData = this.selection.selected;
		if (selectedData.length > 0) {
			const selectedIds = selectedData.map(row => row.id);
			this.dialog.open(SendSpendComponent, {
				data: {model: this.model, current: selectedIds},
				width: '800px'
			});
		}
	}

	spendExcelReport() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `api/spends/excelReport`;
		this.http.post(url, null, { headers: httpHeaders, responseType: 'blob' })
			.pipe(
				tap(res => {
					if (res) {
						Utils.downloadFile(res, 'Excel', 'Ödemeler Raporu');
					}
				}),
				catchError(err => {
					return err;
				})
			).subscribe();
	}

	removeFilter(item) {
		this.layout.filterItems.splice(this.layout.filterItems.indexOf(item), 1);
		this.loadList();
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.result.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.result.length) {
			this.selection.clear();
		} else {
			this.result.forEach(row => this.selection.select(row));
		}
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
	symbol(entity, field, presetValues  = []) {
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		if (entity && entity.hasOwnProperty('moneyType')) {
			if (entity.moneyType.id === 'Par_Bir_Tl') {
				return ' ' + '\u20BA'; // TL simgesi
			} else if (entity.moneyType.id === 'Par_Bir_Dl') {
				return ' ' + '\u0024'; // Dolar simgesi
			} else if (entity.moneyType.id === 'Par_Bir_Euro') {
				return ' ' + '\u20AC'; // Euro simgesi
			}
		} else if (entity && entity.paymentorder.moneyType && field.name !== 'exchangeMoney' && field.name !== 'payTl') {
			if (entity.paymentorder.moneyType.id === 'Par_Bir_Tl') {
				return ' ' + '\u20BA'; // TL simgesi
			} else if (entity.paymentorder.moneyType.id === 'Par_Bir_Dl') {
				return ' ' + '\u0024'; // Dolar simgesi
			} else if (entity.paymentorder.moneyType.id === 'Par_Bir_Euro') {
				return ' ' + '\u20AC'; // Euro simgesi
			}
		} else if (field.name === 'payTl') {
			return '\u20BA';
		} else {
			return '';
		}
	}

	getFilters() {
		const queryParams = new QueryParamsModel();
		this.baseService.find(queryParams, 'layouts').subscribe(res2 => {
			this.filters = res2.body.result;
		});
	}

	filterChange() {
		if (this.activeFilter && this.activeFilter.values) {
			this.layout.filterItems = JSON.parse(this.activeFilter.values);
		} else {
			this.layout.filterItems = [];
		}
		this.loadList();
	}

	// convertFilter(oldFilter) {
	// 	let newFilter;
	// 	newFilter = JSON.parse(JSON.stringify(this.defaultFilter));
	// 	for (const item of oldFilter) {
	// 		newFilter.push(item);
	// 	}
	// 	return newFilter;
	// }
	formatDate (date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	add(presetValues?) {
		const entity = {};
		this.edit(entity, undefined, presetValues);
		/*if (this.model.apiName === 'stores') {
			this.dialog.open(StoreDialogComponent, {width: '440px'});
		}*/
	}

	edit(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		const dialogRef = this.dialog.open(EditEntityDialogComponent, {data: {entity, model: this.model}});
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				Utils.showActionNotification('Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
			}
			this.loadList();
			this.change.emit(this.result);
		});
		/*if (this.model.apiName === 'stores' && entity.buyowner === null) {
			this.dialog.open(StoreDialogComponent, {width: '440px'});
		}*/
	}

	newPerson(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		/*const dialogRef = this.dialog.open(ShowPersonelContractComponent, {
			width: '1200px',
			data: {current: entity, model: this.model}
		});*/
		const dialogRef = this.dialog.open(NewPersonComponent, {
			width: '1200px',
			data: {current: entity, model: this.model}
		});
	}

	okey(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		if (this.model.apiName === 'holidays') {
			entity.approvalStatus = this.baseService.getAttrVal('Izin_Dur_Aktif');
			this.baseService.update(entity, 'holidays').subscribe(() => {
				this.loadList();
			});
		}
		if (this.model.apiName === 'buys') {
			entity.quoteStatus = this.baseService.getAttrVal('Sat_Dur_Onay');
			this.baseService.update(entity, 'buys').subscribe(() => {
				this.loadList();
				this.change.emit(this.result);
			});
		}
		if (this.model.apiName === 'payment_orders') {
			if (entity.base64file === null && entity.paymentSubject.label !== 'Saha Primi') {
				Utils.showActionNotification('Talimatı oluşturan kişi bir dosya eklemeden onay verilemez!', 'warning', 10000, true, false, 3000, this.snackBar);
			} else {
				if (entity.status.id === 'Payment_Status_Red' || entity.status.id === 'Payment_Status_Ode' || entity.status.id === 'Payment_Status_Kısmi' || entity.status.id === 'Payment_Status_OtoOde' || entity.status.id === 'Payment_Status_Onay') {
					Utils.showActionNotification('Bu fatura onay aşamasında değildir!', 'warning', 10000, true, false, 3000, this.snackBar);
				} else if (entity.status.id === 'Payment_Status_Muh' && this.baseService.getMuhUser() !== true ) {
					Utils.showActionNotification('Bu fatura Muhasebe onayı aşamasındadır, sadece Muhasebe Personeli onay verebilir!', 'warning', 10000, true, false, 3000, this.snackBar);
				} else if (entity.status.id === 'Payment_Status_Bek1' && this.baseService.getUserId() !== entity.assigner.id ) {
					Utils.showActionNotification('Bu fatura 1.onay aşamasındadır, sadece 1.onaycı onaylayabilir!', 'warning', 10000, true, false, 3000, this.snackBar);
				} else if (entity.status.id === 'Payment_Status_Bek2' && this.baseService.getUserId() !== entity.secondAssigner.id ) {
					Utils.showActionNotification('Bu fatura 2.onay aşamasındadır, sadece 2.onaycı onaylayabilir!', 'warning', 10000, true, false, 3000, this.snackBar);
				} else if (entity.base64File === null && entity.paymentSubject.label !== 'Saha Primi') {
					Utils.showActionNotification('Faturaya ait bir dosya bulunmamaktadır, onay veremezsiniz!', 'warning', 10000, true, false, 3000, this.snackBar);
				} else {
					let status = '';
					let spendstatus = '';

					if (entity.status.id === 'Payment_Status_Bek1' && entity.paymentSubject.id !== 'Payment_Sub_Saha') {
						status = this.baseService.getAttrVal('Payment_Status_Muh').id;
						spendstatus = this.baseService.getAttrVal('Payment_Status_Muh').label;
					}

					if (entity.status.id === 'Payment_Status_Bek1' && entity.paymentSubject.id === 'Payment_Sub_Saha') {
						status = this.baseService.getAttrVal('Payment_Status_Bek2').id;
						spendstatus = this.baseService.getAttrVal('Payment_Status_Bek2').label;
					}

					if (entity.status.id === 'Payment_Status_Muh') {
						status = this.baseService.getAttrVal('Payment_Status_Bek2').id;
						spendstatus = this.baseService.getAttrVal('Payment_Status_Bek2').label;
					}

					if (entity.status.id === 'Payment_Status_Bek2') {
						status = this.baseService.getAttrVal('Payment_Status_Onay').id;
						spendstatus = this.baseService.getAttrVal('Payment_Status_Onay').label;
					}

					if (entity.status.id === 'Payment_Status_Onay') {
						status = this.baseService.getAttrVal('Payment_Status_Ode').id;
						spendstatus = this.baseService.getAttrVal('Payment_Status_Ode').label;
					}

					const dialogRef = this.dialog.open(PaymentOkeyComponent, {data: {current: entity, model: this.model, paymentStatus: status, spendStatus: spendstatus}, disableClose: true });
					dialogRef.afterClosed().subscribe(res => {
						this.loadList();
						this.change.emit(this.result);
					});
				}
			}
			this.loadList();
			}
		if (this.model.apiName === 'spends') {
			if (entity.paymentorder.moneyType.id === 'Par_Bir_Dl' && entity.paymentorder.paymentStyle.id === 'Payment_Style_Tl' && entity.payTl === 0) {
				Utils.showActionNotification('Lütfen Kur Tutarını girip Ödenen Tl Tutarını bildiriniz!', 'warning', 3000, true, false, 3000, this.snackBar);
			} else {
				const dialogRef = this.dialog.open(SpendOkeyComponent, {data: {current: entity.id, model: this.model, durum: 'Spend_Status_Yes'}, disableClose: true });
				dialogRef.afterClosed().subscribe(res => {
					Utils.showActionNotification('Onaylandı', 'success', 3000, true, false, 3000, this.snackBar);
					this.loadList();
					this.change.emit(this.result);
				});
			}
		}
		if (this.model.name === 'FuelLimit') {
			const dialogRef = this.dialog.open(FuelLimitOkeyComponent, {
				data: {
					current: entity,
					model: this.model,
				}, disableClose: true
			});
			dialogRef.afterClosed().subscribe(res => {
				if (res === 'no') {
					Utils.showActionNotification('Reddedildi', 'success', 3000, true, false, 3000, this.snackBar);
				}
				this.loadList();
				this.change.emit(this.result);
			});
		}
		// this.loadList();
	}
	cancel(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		if (this.model.apiName === 'holidays') {
			entity.approvalStatus = this.baseService.getAttrVal('Izin_Dur_Red');
			this.baseService.update(entity, 'holidays').subscribe(() => {
				this.loadList();
				this.change.emit(this.result);
			});
		}
		if (this.model.apiName === 'buys') {
			entity.quoteStatus = this.baseService.getAttrVal('Sat_Dur_Red');
			this.baseService.update(entity, 'buys').subscribe(() => {
				this.loadList();
				this.change.emit(this.result);
			});
		}
		if (this.model.apiName === 'payment_orders') {
			const status = 'Payment_Status_Red';
			const spendstatus = this.baseService.getAttrVal('Payment_Status_Red').label;
			const dialogRef = this.dialog.open(PaymentOkeyComponent, {
				data: {
					current: entity,
					model: this.model,
					paymentStatus: status,
					spendStatus: spendstatus
				}, disableClose: true
			});
			dialogRef.afterClosed().subscribe(res => {
				this.loadList();
				this.change.emit(this.result);
			});
		}
		if (this.model.apiName === 'spends') {
			if (entity.paymentorder.moneyType.id === 'Par_Bir_Dl' && entity.paymentorder.paymentStyle.id === 'Payment_Style_Tl' && entity.payTl === 0) {
				Utils.showActionNotification('Lütfen Kur Tutarını girip Ödenen Tl Tutarını bildiriniz!', 'warning', 3000, true, false, 3000, this.snackBar);
			} else {
				const dialogRef = this.dialog.open(SpendOkeyComponent, {
					data: {
						current: entity.id,
						model: this.model,
						durum: 'Spend_Status_Red'
					}, disableClose: true
				});
				dialogRef.afterClosed().subscribe(res => {
					// Utils.showActionNotification('Reddedildi', 'success', 3000, true, false, 3000, this.snackBar);
					this.loadList();
					this.change.emit(this.result);
				});
			}
		}
		if (this.model.apiName === 'fuellimits') {
			entity.status = this.baseService.getAttrVal('Fuel_Dur_Red');
			this.baseService.update(entity, 'fuellimits').subscribe(() => {
				this.loadList();
				this.change.emit(this.result);
			});
		}
		// this.loadList();
	}

	showFuelLimit(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		const dialogRef = this.dialog.open(ShowFuelLimitRiskDialogComponent, { data: {current: entity.curcode, model: this.model},
			width: '1200px'
		});
	}
	okey2(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		entity.suggest = true;
		this.baseService.update(entity, 'buys').subscribe(() => {
			this.loadList();
			this.change.emit(this.result);
		});

		// this.loadList();
	}
	createPersonelContract(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		const dialogRef = this.dialog.open(ShowPersonelContractComponent, { data: {current: entity},
			width: '1200px'
		});
	}

	toPay(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}

		const dialogRef = this.dialog.open(SpendToTlComponent, {data: {current: entity.id, model: this.model}, disableClose: true });
		dialogRef.afterClosed().subscribe(res => {
			Utils.showActionNotification('Kaydedildi', 'success', 3000, true, false, 3000, this.snackBar);
			this.loadList();
			this.change.emit(this.result);
		});
	}

	cancel2(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		entity.suggest = false;
		this.baseService.update(entity, 'buys').subscribe(() => {
			this.loadList();
			this.change.emit(this.result);
		});

		// this.loadList();
	}

	control(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		if (entity.status.label === 'Ödendi' || entity.status.label === 'Onaylandı' || entity.status.label === 'Kısmi Ödendi' || entity.status.label === 'Reddedildi' || entity.approvalStatus.label === 'Onaylandı') {
			return false;
		} else {
			entity.showButton = true;
			return true;
		}
	}
	okeyQuote(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		entity.preparation = this.baseService.getAttrVal('Tek_Dur_Tam');
		this.baseService.update(entity, 'buys').subscribe((res) => {
			this.loadList();
			this.change.emit(this.result);
		});
	}

	correct(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		if (entity.owner === null || entity.owner.id !== this.baseService.getUserId()) {
			Utils.showActionNotification('Bu faturanın sahibi siz değilsiniz!', 'warning', 10000, true, false, 3000, this.snackBar);
		} else if (entity.invoiceStatus.id === 'Fatura_Durumlari_Donus') {
			Utils.showActionNotification('Bu fatura daha önceden talimata dönüştürüldü!', 'warning', 10000, true, false, 3000, this.snackBar);
		} else {
			const dialogRef = this.dialog.open(EditEntityDialogComponent, {data: {entity, model: this.model}});
			dialogRef.afterClosed().subscribe(res => {
				if (res) {
					Utils.showActionNotification('Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
				}
				this.loadList();
				this.change.emit(this.result);
			});
		}
	}

	connectStore(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		const dialogRef = this.dialog.open(ConnectStoreDialogComponent, {data: {current: entity, model: this.model}});
		dialogRef.afterClosed().subscribe(res => {
			Utils.showActionNotification('Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
			this.loadList();
			this.change.emit(this.result);
		});
	}

	showFiles(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		const dialogRef = this.dialog.open(FileManagerDialogComponent, {
			width: '800px',
			data: {current: entity, model: this.model}
		});
		dialogRef.afterClosed().subscribe(() => {
		});
	}

	formHoliday(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		const dialogRef = this.dialog.open(ReportManagerDialogComponent, {
			width: '800px',
			data: {current: entity, model: this.model}
		});
	}

	infoPaymentOrder(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		const dialogRef = this.dialog.open(PaymentOrderInfoDialogComponent, {
			width: '1500px',
			data: {current: entity, model: this.model}
		});
		dialogRef.afterClosed().subscribe(() => {
		});
	}
	infoSpend(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		const dialogRef = this.dialog.open(SpendInfoDialogComponent, {
			width: '1500px',
			data: {current: entity, model: this.model}
		});
		dialogRef.afterClosed().subscribe(() => {
		});
	}

	uploadBase64File(entity, e?, presetValues = [], subject?: string) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		const dialogRef = this.dialog.open(Base64FileDialogComponent, {
			width: '800px',
			data: {current: entity, model: this.model, subject},
			disableClose: true,
		});
		dialogRef.afterClosed().subscribe(() => {
			this.loadList();
		});
	}

	showBase64File(entity, e?, presetValues = [], subject?: string) {
		if (e) { e.stopPropagation(); }
		const apiUrl = 'api/file_containers/showFile';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const locName = this.model.name;
		const location = entity.id.toString();
		this.http.get(apiUrl + `?location=${location}&locName=${locName}&subject=${subject}`, { headers: httpHeaders, responseType: 'text' }).subscribe(
			response => {
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
			},
			error => {
				Utils.showActionNotification('Dosya bulunamadı!', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		);
	}

	sendOwner(entity, e?, presetValues = []) {
		if (e) { e.stopPropagation(); }
		if (entity.invoiceStatus.id !== 'Fatura_Durumlari_Donus' && entity.invoiceStatus.id !== 'Fatura_Durumlari_Mukerrer' && entity.invoiceStatus.id !== 'Fatura_Durumlari_Iptal') {
			return this.dialog.open(SendInvoiceComponent, {
				data: {model: this.model, current: entity},
				width: '600px'
			});
		} else {
			Utils.showActionNotification('Talimata Dönüştürülen, mükerrer olan veya iptal olan bir faturaya atama yapamazsınız!', 'warning', 10000, true, false, 3000, this.snackBar);
		}
	}
	changeUserRole(entity, e?, presetValues = []) {
		if (e) { e.stopPropagation(); }
		return this.dialog.open(ChangeRoleComponent, {
			data: {model: this.model, current: entity},
			width: '600px'
		});
	}
	changeUserActivate(entity, e?, presetValues = []) {
		if (e) { e.stopPropagation(); }
		entity.activated = false;
		this.baseService.update(entity, 'users').subscribe(() => {
			Utils.showActionNotification('Kullanıcı pasife alındı', 'success', 3000, true, false, 3000, this.snackBar);
		});
	}
	changeUserGroup(entity, e?, presetValues = []) {
		if (e) { e.stopPropagation(); }
		return this.dialog.open(ChangeGroupComponent, {
			data: {model: this.model, current: entity},
			width: '600px'
		});
	}
	changecenter(entity, e?, presetValues = []) {
		if (e) { e.stopPropagation(); }
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		entity.status = this.baseService.getAttrVal('Söz_Dur_Kar');
		this.baseService.update(entity, 'stores').subscribe(() => {
			this.loadList();
			this.change.emit(this.result);
		});

		//this.loadList();
	}
	cancelBuyOwner(entity, e?, presetValues = []) {
		if (e) { e.stopPropagation(); }
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		entity.status = this.baseService.getAttrVal('Söz_Dur_Pasif');
		this.baseService.update(entity, 'stores').subscribe(() => {
			this.loadList();
			this.change.emit(this.result);
		});

		//this.loadList();
	}
// SATIRLARI RENKLENDİRME
	getRowClasses(row: any, even: boolean): any {
		return {
			gray: even,
			priority_low: row['invoiceStatus'] && row['invoiceStatus'].label === 'Kabul Edilmedi',
			priority_medium: row['invoiceStatus'] && row['invoiceStatus'].label === 'Atandı',
			priority_high: row['invoiceStatus'] && row['invoiceStatus'].label === 'Talimata Dönüştürüldü',
			priority_muk: row['invoiceStatus'] && row['invoiceStatus'].label === 'Mükerrer Fatura',
			priority_error: row['invoiceStatus'] && row['invoiceStatus'].label === 'Hatalı Atama',
			priority_cancel: row['invoiceStatus'] && row['invoiceStatus'].label === 'İptal',
			priority_spend_success: this.model.name === 'Spend' && row['status'] && row['status'].label === 'Ödendi',
			priority_payment_order_success: this.model.name === 'PaymentOrder' && row['status'] && row['status'].label === 'Ödendi',
			priority_payment_order_half_success: this.model.name === 'PaymentOrder' && row['status'] && row['status'].label === 'Kısmi Ödendi',
			priority_payment_order_oto_success: this.model.name === 'PaymentOrder' && row['status'] && row['status'].label === 'Otomatik Ödemede',
			priority_payment_order_acikOdeme: this.model.name === 'PaymentOrder' && row['paymentSubject'] && row['closePdf'] === false && row['paymentSubject'].label === 'Açık Ödeme',
			priority_payment_order_okey: this.model.name === 'PaymentOrder' && row['status'] && row['status'].label === 'Onaylandı',
			priority_payment_order_cancel: this.model.name === 'PaymentOrder' && row['status'] && row['status'].label === 'Reddedildi',
			priority_spend_cancel: this.model.name === 'Spend' && row['status'] && row['status'].label === 'Reddedildi',
			fuel_limit_okey: this.model.name === 'FuelLimit' && row['status'] && row['status'].label === 'Onaylandı',
			fuel_limit_cancel: this.model.name === 'FuelLimit' && row['status'] && row['status'].label === 'Reddedildi'
		};
	}

	delete(_item: any, e) {
		if (e) { e.stopPropagation(); }

		const dialogRef = this.deleteElement();
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.baseService.delete(_item.id, this.model.apiName).subscribe(() => {
				Utils.showActionNotification('Silindi', 'success', 10000, true, false, 3000, this.snackBar);
				this.loadList();
				this.change.emit(this.result);
			});
		});
	}

	deleteElement() {
		return this.dialog.open(DeleteEntityDialogComponent, {
			data: {},
			width: '440px'
		});
	}

	updateStatus(_statuses) {
		const _messages = [];

		this.selection.selected.forEach(elem => {
			_messages.push({
				text: `${elem.name}`,
				id: elem.id.toString(),
				status: elem.status,
				statusTitle: elem.statusId ? _statuses[elem.statusId].title : '',
				statusCssClass: elem.statusId ? _statuses[elem.statusId].css : ''
			});
		});

		const dialogRef = this.updateStatusDialog('Statü güncellemesi yapılacak. Emin misiniz?', _statuses, _messages);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.selection.clear();
				return;
			}

			this.baseService
				.updateStatus(this.selection.selected, +res)
				.subscribe(() => {
					Utils.showActionNotification('Statü güncellendi', 'success', 10000, true, false, 3000, this.snackBar);
					this.loadList();
					this.selection.clear();
				});
		});
	}

	updateStatusDialog(title, statuses, messages) {
		return this.dialog.open(UpdateStatusDialogComponent, {
			data: { title, statuses, messages },
			width: '480px'
		});
	}

	exportFile(type) {
		if (this.baseService.loadingSubject.value) { return; }
		this.baseService.loadingSubject.next(true);
		const queryParams = new QueryParamsModel(
			undefined,
			undefined,
			undefined,
			undefined,
			undefined
		);
		queryParams.fileType = type; // csv, text
		queryParams.search = this.searchStr;
		queryParams.assigner = 'ALL';
		queryParams.owner = 'ALL';
		queryParams.other = 'ALL';
		queryParams.size = 100;
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post('api' + '/' + this.model.apiName, queryParams, { headers: httpHeaders, responseType: 'blob' })
			.pipe(
				tap(res => {
					Utils.downloadFile(res, type, this.model.name);
					this.baseService.loadingSubject.next(false);
				}),
				catchError(err => {
					this.baseService.loadingSubject.next(false);
					return err;
				})
			).subscribe();
	}

	bulkDelete() {
		this.bottomSheet.open(DeleteConfirmComponent).afterDismissed().subscribe((doIt) => {
			if (doIt) {
				let count = 1;
				this.selection.selected.forEach(elem => {
					if (elem.isKPAPG) { return; }
					this.baseService.delete(elem.id, this.model.apiName).subscribe(() => {
						if (count === this.selection.selected.length) {
							Utils.showActionNotification('Kayıtlar silindi', 'success', 10000, true, false, 3000, this.snackBar);
							this.loadList();
						}
						count++;
					});
				});
			}
		});
	}

	mergeSelected() {
		if (this.selection.selected.length === 1) {
			if (!this.baseService.entityToMerge) {
				this.baseService.entityToMerge = this.selection.selected[0];
				Utils.showActionNotification('Birleştirme için bekletiliyor: ' + this.baseService.entityToMerge.name, 'warning', 0, false, true, 0, this.snackBar).subscribe(() => {
					this.baseService.entityToMerge = undefined;
				});
			} else {
				this.mergeEntities(this.baseService.entityToMerge, this.selection.selected[0]);
			}
		} else if (this.selection.selected.length === 2) {
			if (!this.baseService.entityToMerge) {
				this.mergeEntities(this.selection.selected[0], this.selection.selected[1]);
			} else {
				Utils.showActionNotification('Birleştirme işlemi en fazla 2 kayıtla yapılabilir', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		} else {
			Utils.showActionNotification('Birleştirme işlemi en fazla 2 kayıtla yapılabilir', 'warning', 10000, true, false, 3000, this.snackBar);
		}
	}

	mergeEntities(entity1, entity2) {
		let masterEntity;
		let slaveEntity;
		if (entity1.id === entity2.id) {
			const entityToMerge = this.baseService.entityToMerge;
			Utils.showActionNotification('Seçili müşteriler birbirinin aynıdır', 'warning', 10000, true, false, 3000, this.snackBar).subscribe(() => {
				if (entityToMerge) {
					this.baseService.entityToMerge = entityToMerge;
					Utils.showActionNotification('Birleştirme için bekletiliyor: ' + this.baseService.entityToMerge.name, 'warning', 0, false, true, 0, this.snackBar).subscribe(() => {
						this.baseService.entityToMerge = undefined;
					});
				}
			});
			return;
		} else if (entity1.status.name === 'Potansiyel' && (entity2.status.name === 'Aktif' || entity2.status.name === 'Pasif')) {
			masterEntity = entity2; slaveEntity = entity1;
		} else if (entity2.status.name === 'Potansiyel' && (entity1.status.name === 'Aktif' || entity1.status.name === 'Pasif')) {
			masterEntity = entity1; slaveEntity = entity2;
		} else {
			const entityToMerge = this.baseService.entityToMerge;
			Utils.showActionNotification('Seçili müşterilerden biri KPAPG müşterisi, diğeri potansiyel olmalıdır', 'warning', 10000, true, false, 3000, this.snackBar).subscribe(() => {
				if (entityToMerge) {
					this.baseService.entityToMerge = entityToMerge;
					Utils.showActionNotification('Birleştirme için bekletiliyor: ' + this.baseService.entityToMerge.name, 'warning', 0, false, true, 0, this.snackBar).subscribe(() => {
						this.baseService.entityToMerge = undefined;
					});
				}
			});
			return;
		}
		this.baseService.update(undefined, 'Customer/MergeCustomer?masterId=' + masterEntity.id + '&difId=' + slaveEntity.id).subscribe(() => {
			this.baseService.entityToMerge = undefined;
			Utils.showActionNotification('Kayıtlar birleştirildi', 'success', 3000, true, false, 3000, this.snackBar);
			this.loadList();
		});
	}

	showFilterDialog() {
		const dialogRef = this.dialog.open(FilterDialogComponent, { data: { layout: this.layout, model: this.model } });
		dialogRef.afterClosed().subscribe(() => {
			this.loadList();
		});
	}

	filterOptions(field: any, value: any) {
		this.filteredOptionss[field.name] = [];
		this.timer = setTimeout(function () {
		if (this.timer) {
			clearTimeout(this.timer);
		}

		if (this.hareketlerTedarikci !== undefined) {
			const filters2 = new Set();
			filters2.add({
				name: 'name',
				operator: 'EQUALS',
				value: field
			});
			const queryParams2 = new QueryParamsModel(
				Utils.makeFilter(filters2),
				[{ sortBy: 'name', sortOrder: 'ASC' }],
				0,
				10000
			);
			this.baseService.find(queryParams2, 'customers').subscribe(res => {
				this.filteredOptionss[this.hareketlerTedarikci] = res.body;
			});
		} else {
			const filters = new Set();
			if (value && value.length >= 0) {
				filters.add({
					name: 'instanceName',
					operator: 'CONTAINS',
					value
				});
			}
			if (field.name === 'district') {
				filters.add({
					name: 'city.id',
					operator: 'EQUALS',
					value: this.entityForm.controls.city.value ? this.entityForm.controls.city.value.id : null
				});
			}
			const queryParams = new QueryParamsModel(
				Utils.makeFilter(filters),
				[{ sortBy: Utils.getModel(field.objectApiName).displayField, sortOrder: 'ASC' }],
				0,
				10000
			);

			this.baseService.find(queryParams, field.objectApiName).subscribe(res => {
				this.filteredOptionss[field.name] = res.body;
			});
			if (field.name === 'paymentorder') {
				this.baseService.find(queryParams, field.objectApiName).subscribe(res => {
					this.filteredOptionss[field.name] = res.body;
				});
			}
		}
		if (field.name !== 'district' && field.name !== 'city' && !(value.length > 0)) { return; }
		}.bind(this), 500);
	}

	objectDisplay(field, option) {
		return option ? option['instanceName'] : option;
	}
}

