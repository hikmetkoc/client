import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef, Output, EventEmitter, AfterViewInit, OnInit, ViewEncapsulation } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSnackBar, MatDialog, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseDataSource } from '../base.datasource';
import { BaseService } from '../base.service';
import { Utils } from '../utils';
import { FormGroup, Validators } from '@angular/forms';
import { QueryParamsModel } from '../models/query-params.model';
import { Filter } from '../models/filter';

@Component({
	selector: 'kt-lineitems',
	templateUrl: './lineitems.component.html',
	styleUrls: ['./lineitems.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.Default
})
export class LineItemsComponent implements AfterViewInit, OnInit {

	@Input() parentModel: any;
	@Input() parentId: number;
	@Input() objectName: any;
	@Input() objects: any[];
	@Input() readOnly: boolean;

	@Output() rowClick = new EventEmitter<boolean>();

	@ViewChild(MatPaginator, undefined) paginator: MatPaginator;
	@ViewChild(MatSort, undefined) sort: MatSort;
	@ViewChild('searchInput', undefined) searchInput: ElementRef;

	filter: any[] = [];
	activeFilter: any = 'All';
	mapTranslate: Map<string, string>;
	search: string;
	actions: string;
	displayedColumns = [];
	filters: any = [];
	selection = new SelectionModel<any>(true, []);
	result: any[] = [];
	model: { apiName: { toUpperCase: () => string; }; fields: any; };
	utils = Utils;
	filteredOptionss = {};
	entityForm: FormGroup;
	dataSource: BaseDataSource;
	timer: any;

	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public baseService: BaseService) {
	}

	ngOnInit() {
		this.model = Utils.getModel(this.objectName);

		if (this.objects) {
			this.dataSource = new BaseDataSource(this.baseService);
			this.dataSource.entitySubject.next(this.parseValues(this.objects));
		} else if (this.parentModel) {
			this.dataSource = new BaseDataSource(this.baseService);
			this.dataSource.url = '' + this.model.apiName;

			const call = this.dataSource.loadAfter(new QueryParamsModel(new Filter(this.parentModel.name.toLowerCase() + '.id', '' + this.parentId)));
			call.subscribe(
				() => {
					this.dataSource.entitySubject.next(this.parseValues(this.dataSource.entitySubject.value));
				}
			);
		} else {
			this.dataSource = new BaseDataSource(this.baseService);
		}
	}

	ngAfterViewInit() {
		this.displayColumns();
	}

	displayColumns() {
		for (const field of this.model.fields) {
			if (field.display) {
				this.displayedColumns.push(field.name);
			}
		}
		this.displayedColumns.push('actions');
	}

	parseValues(rows: any) {
		for (const row of rows) {
			for (const field of this.model.fields) {
				let value = row[field.name];
				if (field.fieldType === 'object') {
					value = Utils.isSet(value) ? value : field.default || {};
				} else if (field.fieldType === 'percentage' || field.fieldType === 'currency' || field.fieldType === 'number') {
					value = Utils.isSet(value) ? Utils.makeTurkish(value) : field.default || '';
				} else {
					value = Utils.isSet(value) ? value.toString() : field.default || '';
				}
				row[field.name] = value;
			}
		}
		return rows;
	}

	makeValidators(field: { required: any; fieldType: string; inputType: string; length: number; }) {
		const validators = [];
		if (field.required) { validators.push(Validators.required); }
		if (field.fieldType === 'email') { validators.push(Validators.email); }
		if (field.fieldType === 'url') { validators.push(Validators.pattern); }
		if (field.fieldType === 'text' || field.fieldType === 'number') {
			validators.push(Validators.maxLength(field.length));
		}
		return validators;
	}

	filterOptions(field: any, row: any, value: any) {
		this.filteredOptionss[field.name] = [];
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = setTimeout(function() {
			const filters = [];
			if (value.length >= 0) { filters.push({ FieldName: field.displayField, Operation: 'Contains', Value: value }); }
			if (field.name === 'product' && row.productGroup) {
				filters.push({ FieldName: 'productGroup.id', Operation: 'EqualTo', Value: row.productGroup.id });
			}
			const queryParams = new QueryParamsModel(
				filters,
				[{ sortBy: field.displayField, sortOrder: 'ASC' }],
				0,
				10000
			);

			this.baseService.find(queryParams, field.apiName).subscribe(res => {
				this.filteredOptionss[field.name] = res.body;
			});
		}.bind(this), 500);
	}

	delete(row: any) {
		const array = this.dataSource.entitySubject.value;
		for (let i = 0; i < array.length; i++) {
			if (JSON.stringify(array[i]) === JSON.stringify(row)) {
				if (array[i].id > 0) { array[i].isDeleted = true; } else { array.splice(i, 1); }
				break;
			}
		}
		this.dataSource.entitySubject.next(array);
	}

	add() {
		const newRow = {};
		for (const field of this.model.fields) {
			newRow[field.name] = undefined;
		}
		this.dataSource.entitySubject.value.push(newRow);
		this.dataSource.entitySubject.next(this.dataSource.entitySubject.value);
	}

	objectDisplay(field: any, option: any) {
		return option ? option[field.displayField] : option;
	}

	fieldChange(field: any, row: any, value: any) {
		if (field.name === 'quantity' || field.name === 'discount' || field.name === 'unitListPrice') {
			if (row['unitListPrice'] && row['quantity']) {
				if (!row['discount']) { row['discount'] = 0; }
				// tslint:disable-next-line:max-line-length
				row['salesPrice'] = Utils.makeTurkish(Math.round(((Utils.currency2Float(row['unitListPrice']) * Utils.currency2Float(row['quantity'])) * ((100 - Utils.currency2Float(row['discount'])) / 100)) * 100) / 100);
			}
		} else if (field.name === 'salesPrice') {
			if (row['salesPrice'] && row['unitListPrice'] && row['quantity']) {
				row['discount'] = Utils.makeTurkish(Math.round((((Utils.currency2Float(row['unitListPrice']) * Utils.currency2Float(row['quantity'])) - Utils.currency2Float(row['salesPrice'])) * 100)
					/ ((Utils.currency2Float(row['unitListPrice']) * Utils.currency2Float(row['quantity']))) * 100) / 100);
			}
		} else if (field.name === 'productGroup' && field.multiple) {
			if (value.id !== undefined) {
				const array = this.dataSource.entitySubject.value;
				for (const item of array) {
					if (JSON.stringify(item) === JSON.stringify(row)) {
						item.product = undefined;
						break;
					}
				}
				this.dataSource.entitySubject.next(this.dataSource.entitySubject.value);
			}
		}
	}
}
