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
import {FileManagerDialogComponent} from "../detail/filemanager/file-manager-dialog/file-manager-dialog.component";
import {FileManagerToolComponent} from "../detail/filemanager/filemanagertool/filemanagertool.component";
import {SendInvoiceComponent} from "../dialogs/send-invoice-dialog/send-invoice.component";
import {errorObject} from "rxjs/internal-compatibility";
import {
	PaymentOrderFileDialogComponent
} from "../dialogs/payment-order-file-dialog/payment-order-file-dialog.component";
import {
	PaymentOrderInfoDialogComponent
} from "../dialogs/payment-order-info-dialog/payment-order-info-dialog.component";
import {User} from "../../../core/auth";
import {SendSpendComponent} from "../dialogs/send-spend-dialog/send-spend.component";
import {SpendToTlComponent} from "../dialogs/spend-to-tl-dialog/spend-to-tl.component";
import {ConnectStoreDialogComponent} from "../dialogs/connect-store-dialog/connect-store-dialog.component";
import {SpendOkeyComponent} from "../dialogs/spend-okey-dialog/spend-okey.component";
import {PaymentOkeyComponent} from "../dialogs/payment-okey-dialog/payment-okey.component";
import {reportInvalidActions} from "@ngrx/effects/src/effect_notification";
import {ChangeRoleComponent} from "../dialogs/change-role-dialog/change-role.component";
import {ChangeGroupComponent} from "../dialogs/change-group-dialog/change-group.component";

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
	onayci: boolean;
	onayci2: boolean;
	satinalmaci: boolean;
	eklimitonayi: boolean;
	taleponaycisi: boolean;
	finans: boolean;
	uruntalep: boolean;
	storebuyownerid;
	teklifsay: number;
	tablo: any;
	kalanizin: any;
	kullanilanizin: any;
	izinbul = [];
	loading: boolean;

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
		this.izinBul();
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

	loadList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel();
		if (this.model.name !== 'User') {
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
			if (this.baseService.getUser().birim.id === 'Birim_Muh') {
				filters.add({
					name: 'id',
					operator: FilterOperation.EQUALS,
					value: this.baseService.getUser().id
				});
			}
			if ((this.baseService.getUser().birim.id === 'Birim_Loher' || this.baseService.getUser().birim.id === 'Birim_Avelice') && this.baseService.getUser().unvan.id === 'Unvan_Muh_Uzm') {
				filters.add({
					name: 'id',
					operator: FilterOperation.EQUALS,
					value: this.baseService.getUser().id
				});
			}
		}
		if (this.model.name === 'InvoiceList') {
			if (this.baseService.getUserId() === 90) {
				filters.add({
					name: 'createdBy',
					operator: FilterOperation.EQUALS,
					value: 1
				});
			}
			if (this.baseService.getUser().birim.id === 'Birim_Fin') {
				filters.add({
					name: 'owner',
					operator: FilterOperation.EQUALS,
					value: this.baseService.getUserId()
				});
			}
		}
		if (this.model.name === 'PaymentOrder') {
			if (this.baseService.getUser().birim.id === 'Birim_Muh') {
				filters.add({
					name: 'status',
					operator: FilterOperation.EQUALS,
					value: 'Payment_Status_Muh'
				});
			}
			if (this.baseService.getUser().birim.id === 'Birim_Loher' && this.baseService.getUser().unvan.id === 'Unvan_Muh_Uzm') {
				filters.add({
					name: 'cost',
					operator: FilterOperation.EQUALS,
					value: 'Cost_Place_MeteorIzmir'
				});
			}
			if (this.baseService.getUser().birim.id === 'Birim_Avelice' && this.baseService.getUser().unvan.id === 'Unvan_Muh_Uzm') {
				filters.add({
					name: 'cost',
					operator: FilterOperation.IN,
					value: ['Cost_Place_Avelice', 'Cost_Place_MeteorIgdir']
				});
			}
			if (this.baseService.getUser().birim.id === 'Birim_Fin') {
				filters.add({
					name: 'status',
					operator: FilterOperation.IN,
					value: ['Payment_Status_Onay', 'Payment_Status_Ode', 'Payment_Status_Kısmi']
				});
			}
		}
		if (this.model.name === 'Customer') {	// Merkez muhasebe Tedarikçileri görüntüleyemesin.
			if (this.baseService.getUser().birim.id === 'Birim_Muh') {
				filters.add({
					name: 'id',
					operator: FilterOperation.EQUALS,
					value: null
				});
			}
		}
		if (this.model.name === 'Spend') {
			if (this.baseService.getUser().birim.id === 'Birim_Fin') {
				filters.add({
					name: 'finance',
					operator: FilterOperation.EQUALS,
					value: 1
				});
				filters.add({
					name: 'paymentStatus',
					operator: FilterOperation.IN,
					value: ['Onaylandı', 'Kısmi Ödendi', 'Ödendi', 'Reddedildi']
				});
			}
			if (this.baseService.getUser().birim.id === 'Birim_Muh') {
				filters.add({
					name: 'createdBy',
					operator: FilterOperation.EQUALS,
					value: 1
				});
			}
		}
		if (this.model.name === 'Holiday' && this.baseService.getUserId() === 99) {
			filters.add({
				name: 'assigner',
				operator: FilterOperation.EQUALS,
				value: 99
			});
		}
		if (this.model.name === 'Document') {
			if (this.baseService.getUser().unvan.id !== 'Unvan_Idr_Mud' && this.baseService.getUserId() !== 2000 && this.baseService.getUserId() !== 2) {
				if (this.baseService.getUser().birim.id === 'Birim_Satin' && this.baseService.getUser().unvan.id === 'Unvan_Ope_Sat_Mud') {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Sirket_Doc_Meteor', 'Sirket_Doc_Cemcan', 'Sirket_Doc_Ncc', 'Sirket_Doc_Simya', 'Sirket_Doc_Genel']
					});
				} else if (this.baseService.getUser().sirket.id === 'Sirket_Cemcan' && this.baseService.getUser().unvan.id === 'Unvan_Ist_Amr') {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Sirket_Doc_Cemcan', 'Sirket_Doc_Genel']
					});
				} else if (this.baseService.getUser().sirket.id === 'Sirket_Ncc' && this.baseService.getUser().unvan.id === 'Unvan_Ist_On') {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Sirket_Doc_Ncc', 'Sirket_Doc_Genel']
					});
				} else if (this.baseService.getUser().birim.id === 'Birim_Ter' && this.baseService.getUser().unvan.id === 'Unvan_Ist_Amr') {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Sirket_Doc_Meteor', 'Sirket_Doc_Genel']
					});
				} else if (this.baseService.getUser().birim.id === 'Birim_Kafe' && this.baseService.getUser().unvan.id === 'Unvan_Isl_Mud') {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Sirket_Doc_Simya', 'Sirket_Doc_Genel']
					});
				} else if (this.baseService.getUserId() === 9 || this.baseService.getUserId() === 14 || this.baseService.getUserId() === 18 || this.baseService.getUserId() === 94) {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.IN,
						value: ['Sirket_Doc_MeteorIns', 'Sirket_Doc_Genel']
					});
				} else {
					filters.add({
						name: 'sirket',
						operator: FilterOperation.EQUALS,
						value: 'Sirket_Doc_Genel'
					});
				}
			}
		}
		queryParams.filter = Utils.makeFilter(filters);
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
		});
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
	addFilterColumns(filters) {	//Filtrelere veri girilirken yapılacak olanlar;
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
			//this.displayedColumns.push('paymentorder1');
			this.displayedColumns.push('paymentorder2');
			this.displayedColumns.push('paymentorder3');
			this.displayedColumns.push('paymentorder4');
			this.displayedColumns.push('paymentorder5');
			this.displayedColumns.push('paymentorder6');
			this.displayedColumns.push('paymentorder7');
			this.displayedColumns.push('paymentorder8');
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
			const url = `api/payment_orders/selectedExcelReport`;
			const requestData = { ids: selectedIds };

			this.http.post(url, requestData, { headers: httpHeaders, responseType: 'blob' })
				.pipe(
					tap(res => {
						if (res) {
							Utils.downloadFile(res, 'Excel', 'Seçili Ödeme Talimatı Raporu');
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
		if (this.model.apiName === 'stores') {
			this.dialog.open(StoreDialogComponent, {width: '440px'});
		}
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
		if (this.model.apiName === 'stores' && entity.buyowner === null) {
			this.dialog.open(StoreDialogComponent, {width: '440px'});
		}
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
				this.change.emit(this.result);
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
			if (entity.base64file === null) {
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
				} else if (entity.base64File === null) {
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
			const dialogRef = this.dialog.open(SpendOkeyComponent, {data: {current: entity.id, model: this.model, durum: 'Spend_Status_Yes'}, disableClose: true });
			dialogRef.afterClosed().subscribe(res => {
				Utils.showActionNotification('Onaylandı', 'success', 3000, true, false, 3000, this.snackBar);
				this.loadList();
				this.change.emit(this.result);
			});
		}
		if (this.model.name === 'FuelLimit') {

			/*entity.status = this.baseService.getAttrVal('Fuel_Dur_Onay');
			this.baseService.update(entity, 'fuellimits').subscribe(() => {
				this.loadList();
				this.change.emit(this.result);
			});*/
			const httpHeaders = this.httpUtils.getHTTPHeaders();
			const fuelTl = Number(entity.fuelTl);
			const curcode = entity.curcode;
			const description = entity.description;
			const startDate1 = new Date(entity.startDate);
			const endDate1 = new Date(entity.endDate);
			const startDate = this.formatDate(startDate1);
			const endDate = this.formatDate(endDate1);

			const servisSifre = '14ADa23.';
			const firmaKodu = 875257;
			const cariKodu = curcode;
			const apiUrl = `https://srv.meteorpetrol.com/DisServis/riskdetayget?ServisSifre=${servisSifre}&CariKodu=${cariKodu}&FirmaKodu=${firmaKodu}`;

			/*const requestBody = {
				ServisSifre : '14ADa23.',
				FirmaKodu : 875257,
				KullaniciId : 47468,
				CariKodu : curcode,
				EkLimitTutar : fuelTl,
				EkLimitAciklama : description,
				BaslangicTarihi : startDate,
				BitisTarihi : endDate
			};*/
			//const apiUrl = `api/invoice_lists/${entity.invoiceNum}`;

			this.http.get(apiUrl, { headers: httpHeaders, responseType: 'json' })
				.subscribe(
					(response) => {
						console.log('API Cevabı:', response);
						const cariKoduRes = response[0].CariUnvan + ' - ' + response[0].KullanilabilirLimit + ' - ' + response[0].NakitRisk;
						console.log('RES Cevabı:', cariKoduRes);
						const apidescription = cariKoduRes || 'Bir sorun ile karşılaşıldı, lütfen girdiğiniz Cari Kodunu kontrol edin veya Ferit Bey ile iletişime geçiniz!';
						Utils.showActionNotification(apidescription, 'success', 10000, true, false, 3000, this.snackBar);
					},
					(error) => {
						Utils.showActionNotification(error.toString(), 'success', 10000, true, false, 3000, this.snackBar);
					}
				);

			/*const requestBody = {
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
					},
					(error) => {
						Utils.showActionNotification(error.toString(), 'success', 10000, true, false, 3000, this.snackBar);
					}
				);*/
		}
		this.loadList();
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
			const dialogRef = this.dialog.open(SpendOkeyComponent, {data: {current: entity.id, model: this.model, durum: 'Spend_Status_Red'}, disableClose: true });
			dialogRef.afterClosed().subscribe(res => {
				//Utils.showActionNotification('Reddedildi', 'success', 3000, true, false, 3000, this.snackBar);
				this.loadList();
				this.change.emit(this.result);
			});
		}
		if (this.model.apiName === 'fuellimits') {
			entity.status = this.baseService.getAttrVal('Fuel_Dur_Red');
			this.baseService.update(entity, 'fuellimits').subscribe(() => {
				this.loadList();
				this.change.emit(this.result);
			});
		}
		this.loadList();
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

		//this.loadList();
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

		//this.loadList();
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
			Utils.showActionNotification('Bu faturanın sahibi siz değilsiniz!','warning', 10000, true, false, 3000, this.snackBar);
		} else if (entity.invoiceStatus.id === 'Fatura_Durumlari_Donus') {
			Utils.showActionNotification('Bu fatura daha önceden talimata dönüştürüldü!','warning', 10000, true, false, 3000, this.snackBar);
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

	uploadFile(entity, e?, presetValues = []) {
		this.loading = true;
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		if (entity.name === 'null FATURADAN GELEN') {
			Utils.showActionNotification('Bu fatura, Fatura Listesinden gelmektedir. İçerisine başka fatura yükleyemezsiniz!', 'warning', 10000, true, false, 3000, this.snackBar);
		} else if (entity.owner.id !== this.baseService.getUserId()) {
			Utils.showActionNotification('Sadece talimatı oluşturan kişiler dosya eklemesi yapabilir!', 'warning', 10000, true, false, 3000, this.snackBar);
		} else if (entity.status.id !== 'Payment_Status_Bek1') {
			Utils.showActionNotification('Sadece 1.Onay Bekleniyor durumunda faturada değişiklik yapabilirsiniz!', 'warning', 10000, true, false, 3000, this.snackBar);
		} else {
			const dialogRef = this.dialog.open(PaymentOrderFileDialogComponent, {
				width: '800px',
				data: {current: entity, model: this.model},
				disableClose: true,
			});
			dialogRef.afterClosed().subscribe(() => {
				this.loadList();
			});
		}
		this.loading = false;
	}

	toUploadDekont(entity, e?, presetValues = []) {
		this.loading = true;
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		const dialogRef = this.dialog.open(PaymentOrderFileDialogComponent, {
			width: '800px',
			data: {current: entity, model: this.model},
			disableClose: true,
		});
		dialogRef.afterClosed().subscribe(() => {
			this.loadList();
		});
		this.loading = false;
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
	/*showInvoiceFiles(entity, e?, presetValues = []) {
		let fileId = '';
		const filters = new Set();
		filters.add({
			name: 'entityId',
			operator: 'EQUALS',
			value: entity.id
		});
		filters.add({
			name: 'entityName',
			operator: 'EQUALS',
			value: 'PaymentOrder'
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{sortBy: 'createdDate', sortOrder: 'DESC'}],
			0,
			100
		);
		this.baseService.find(queryParams, 'file-descriptors').subscribe(res => {
			for (const hld of res.body) {
				const httpHeaders = this.httpUtils.getHTTPHeaders();
				this.http.post('api/' + this.model.apiName + '/file-show?fileId=' + hld.id, {}, {
					headers: httpHeaders,
					responseType: 'blob'
				})
					.subscribe(
						response => {
							const fileBlob = response;
							const fileUrl = URL.createObjectURL(fileBlob);

							// Yeni bir sekme açarak dosyayı görüntüleme işlemi yapın
							window.open(fileUrl, '_blank');
						},
						error => {
							// Hata durumunda uygun bir bildirim gösterin
							console.log('Dosya görüntüleme hatası:', error);
						}
					);
			}
			this.cdr.markForCheck();
		});
	}*/

	showInvoiceListFiles(entity, e?, presetValues = []) {
		if (e) { e.stopPropagation(); }
		const apiUrl = `api/invoice_lists/${entity.invoiceNum}`;
		const httpHeaders = this.httpUtils.getHTTPHeaders();

		this.http.get(apiUrl, { headers: httpHeaders, responseType: 'text' }).subscribe(
			response => {
				const decodedData = atob(response);
				const uint8Array = new Uint8Array(decodedData.length);
				for (let i = 0; i < decodedData.length; ++i) {
					uint8Array[i] = decodedData.charCodeAt(i);
				}
				const blob = new Blob([uint8Array], { type: 'application/pdf' });
				const fileUrl = URL.createObjectURL(blob);
				window.open(fileUrl, '_blank');
			},
			error => {
				Utils.showActionNotification('Bu Faturaya ait PDF bulunamadı!', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		);
	}

	/*showPaymentOrderListFiles(entity, e?, presetValues = []) {
		if (e) { e.stopPropagation(); }
		const apiUrl = `api/payment_orders/${entity.id}`;
		const httpHeaders = this.httpUtils.getHTTPHeaders();

		this.http.get(apiUrl, { headers: httpHeaders, responseType: 'text' }).subscribe(
			response => {
				const decodedData = atob(response);
				const uint8Array = new Uint8Array(decodedData.length);
				for (let i = 0; i < decodedData.length; ++i) {
					uint8Array[i] = decodedData.charCodeAt(i);
				}
				const blob = new Blob([uint8Array], { type: 'application/pdf' });
				const fileUrl = URL.createObjectURL(blob);
				window.open(fileUrl, '_blank');
			},
			error => {
				Utils.showActionNotification('Bu Faturaya ait PDF bulunamadı!', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		);
	}*/

	showPaymentOrderListFiles(entity, e?, presetValues = []) {
		if (e) { e.stopPropagation(); }
		const apiUrl = `api/payment_orders/${entity.id}`;
		const httpHeaders = this.httpUtils.getHTTPHeaders();

		this.http.get(apiUrl, { headers: httpHeaders, responseType: 'text' }).subscribe(
			response => {
				const decodedData = atob(response);
				const fileSignature = decodedData.substring(0, 4);
				console.log(fileSignature);
				let fileType: string;

				if (fileSignature === '%PDF') {
					fileType = 'application/pdf';
				} else if (fileSignature === 'ÿØÿâ' || fileSignature === 'ÿÛÿà') {
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
					Utils.showActionNotification('Dosya türü belirlenemedi!', 'warning', 10000, true, false, 3000, this.snackBar);
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
				Utils.showActionNotification('Bu Faturaya ait PDF veya PNG bulunamadı!', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		);
	}
	toShowDekont(entity, e?, presetValues = []) {
		if (e) { e.stopPropagation(); }
		const apiUrl = `api/spends/toShowDekont/${entity.id}`;
		const httpHeaders = this.httpUtils.getHTTPHeaders();

		this.http.get(apiUrl, { headers: httpHeaders, responseType: 'text' }).subscribe(
			response => {
				const decodedData = atob(response);
				const fileSignature = decodedData.substring(0, 4);
				console.log(fileSignature);
				let fileType: string;

				if (fileSignature === '%PDF') {
					fileType = 'application/pdf';
				} else if (fileSignature === 'ÿØÿâ' || fileSignature === 'ÿÛÿà') {
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
					Utils.showActionNotification('Dosya türü belirlenemedi!', 'warning', 10000, true, false, 3000, this.snackBar);
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
				Utils.showActionNotification('Bu Dekonta ait PDF veya PNG bulunamadı!', 'warning', 10000, true, false, 3000, this.snackBar);
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

		this.loadList();
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
			priority_cancel: row['invoiceStatus'] && row['invoiceStatus'].label === 'İptal'
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
		if (this.timer) {
			clearTimeout(this.timer);
		}

		if (field.name !== 'district' && field.name !== 'city' && !(value.length > 0)) { return; }
		this.timer = setTimeout(function () {
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
				100
			);

			this.baseService.find(queryParams, field.objectApiName).subscribe(res => {
				this.filteredOptionss[field.name] = res.body;
			});
			if (field.name === 'paymentorder') {
				this.baseService.find(queryParams, field.objectApiName).subscribe(res => {
					this.filteredOptionss[field.name] = res.body;
				});
			}
		}.bind(this), 500);

		/*Hikmet Koç : Birim'e göre Konu*/
		/*this.timer = setTimeout(function () {
			const filters = new Set();
			if (value && value.length >= 0) {
				filters.add({
					name: 'instanceName',
					operator: 'CONTAINS',
					value
				});
			}
			if (field.name === 'type') {
				const selectedBirimId = this.entityForm.controls.birim.value ? this.entityForm.controls.birim.value.id : null;
				filters.add({
					name: 'birim.id',
					operator: 'EQUALS',
					value: selectedBirimId
				});
				filters.add({
					name: 'attribute_id',
					operator: 'EQUALS',
					value: 'Konular'
				});
			}
			const queryParams = new QueryParamsModel(
				Utils.makeFilter(filters),
				[{ sortBy: Utils.getModel(field.objectApiName).displayField, sortOrder: 'ASC' }],
				0,
				100
			);

			this.baseService.find(queryParams, field.objectApiName).subscribe(res => {
				this.filteredOptionss[field.name] = res.body;
			});
		}.bind(this), 500);*/
	}

	objectDisplay(field, option) {
		return option ? option['instanceName'] : option;
	}
}

