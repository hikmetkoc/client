import { Component, Inject, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { BaseService } from '../../base.service';
import { QueryParamsModel } from '../../models/query-params.model';
import { Utils } from '../../utils';
import { getTreeMultipleDefaultNodeDefsError } from '@angular/cdk/tree';


@Component({
	selector: 'kt-filter-dialog',
	templateUrl: './filter-dialog.component.html',
	styleUrls: ['./filter-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class FilterDialogComponent implements OnInit {
	entityForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	phoneMask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
	filterInput: any;
	filterField: any;
	filterOperator: any;
	filterItems: any[] = [];
	selectedOption: any;
	fields;
	toppings = new FormControl();
	toppingList = [];
	utils = Utils;
	filteredOptionss = {};
	timer: any;

	constructor(
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public baseService: BaseService,
		private dateAdapter: DateAdapter<Date>
	) {
		this.dateAdapter.setLocale('tr');
		this.dateAdapter.getFirstDayOfWeek = () => 1;
	}

	ngOnInit() {
		this.filterItems = this.data.layout.filterItems;
		this.populateFields();
	}

	populateFields() {
		this.fields = [];
		const subFields = [];
		for (const field of this.data.model.fields) {
			this.fields.push(field);
			if (field.fieldType === 'object') {
				const model = Utils.getModel(field.apiName);
				if (model) {
					subFields.push(JSON.parse(JSON.stringify(field)));
					for (const subField of model.fields) {
						const newField = JSON.parse(JSON.stringify(subField));
						newField.name = field.name + '.' + subField.name;
						newField.title = field.title + ' > ' + subField.title;
						subFields.push(newField);
					}
				}
			}
		}
		this.fields = this.fields.concat(subFields);
	}

	onSubmit() {
		// this.addFilter();
		this.dialogRef.close(this.filterItems);
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	onNoClick() {
		this.dialogRef.close();
	}

	addFilter() {
		if (this.filterField && this.filterOperator) {
			if (this.filterInput === undefined) {
				this.filterInput = '';
			}
			if (this.filterField.fieldType === 'time' || this.filterField.fieldType === 'date') {
				this.filterInput = Utils.dateFormatForApi(this.filterInput);
			} else if (this.filterField.fieldType === 'phone') {
				this.filterInput = Utils.makeIntegers(this.filterInput).toString();
			} else if (this.filterField.fieldType === 'currency') {
				this.filterInput = Utils.currency2Float(this.filterInput);
			}

			let fieldName = this.filterField.name;
			let value = this.filterInput;
			let valueTitle;

			if (this.filterField.fieldType === 'object') {
				fieldName = this.filterField.name + '.id';
				value = this.filterInput.id;
				valueTitle = this.filterInput[this.filterField.displayField];
			} else if (this.filterField.fieldType === 'select' && this.filterInput) {
				valueTitle = this.baseService.getAttrById(this.filterField.attribute, this.filterInput).name;
			} else if (this.filterField.fieldType === 'boolean') {
				value = this.filterInput ? true : false;
				valueTitle = value ? 'Evet' : 'Hayır';
			}

			this.filterItems.push({
				FieldName: fieldName,
				Operation: this.filterOperator,
				OperationTitle: this.getOperatorTitle(this.filterOperator),
				Value: value,
				Title: this.filterField.title,
				ValueTitle: valueTitle
			});

			this.filterField = undefined;
			this.filterOperator = undefined;
			this.filterInput = undefined;
		}
	}

	getOperatorTitle(operator) {
		switch (operator) {
			case 'EqualTo':
				return 'eşittir';
			case 'GreaterThan':
				return 'büyüktür';
			case 'GreaterThanOrEqualTo':
				return 'büyük eşittir';
			case 'LessThan':
				return 'küçüktür';
			case 'LessThanOrEqualTo':
				return 'küçük eşittir';
			case 'Contains':
				return 'içerir';
			case 'DoesNotContain':
				return 'içermez';
			case 'StartsWith':
				return 'başlar';
			case 'EndsWith':
				return 'biter';
			case 'IsNullOrWhiteSpace':
				return 'boş veya eşdeğeri';
			case 'IsNotNullNorWhiteSpace':
				return 'boş veya eşdeğeri değil';
			case 'IsNull':
				return 'boş';
			case 'IsNotNull':
				return 'boş değil';
			default:
				return '?';
		}
	}

	removeFilter(item) {
		this.filterItems.splice(this.filterItems.indexOf(item), 1);
	}

	filterOptions(field: any, value: any) {
		this.filteredOptionss[field.name] = [];
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = setTimeout(function () {
			const filterItems = [];
			if (value.length >= 0) { filterItems.push({ FieldName: field.displayField, Operation: 'Contains', Value: value }); }
			const queryParams = new QueryParamsModel(
				undefined,
				[{ sortBy: field.displayField, sortOrder: 'ASC' }],
				0,
				100
			);

			this.baseService.find(queryParams, field.apiName).subscribe(res => {
				this.filteredOptionss[field.name] = res.body;
			});
		}.bind(this), 500);
	}

	fieldChange(field: any, row: any, value: any) {
		//
	}
}
