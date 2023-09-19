import {
	Component,
	Inject,
	OnInit,
	ViewEncapsulation,
	ChangeDetectionStrategy,
	Input,
	ViewChild,
	ChangeDetectorRef
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, ErrorStateMatcher, DateAdapter } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { BaseService } from '../../base.service';
import {interval, Observable} from 'rxjs';
import { QueryParamsModel } from '../../models/query-params.model';
import { Utils } from '../../utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import {FileManagerDialogComponent} from "../../detail/filemanager/file-manager-dialog/file-manager-dialog.component";
import {FileManagerToolComponent} from "../../detail/filemanager/filemanagertool/filemanagertool.component";
import {FileManagerComponent} from "../../detail/filemanager/filemanager.component";
import {MatDialog} from "@angular/material/dialog";
import {catchError, concatMap, takeWhile, tap} from "rxjs/operators";
import { HttpClient } from '@angular/common/http';
import { HttpUtilsService } from '../../http-utils.service';
import {Quote} from "@angular/compiler";
import {FilterOperation} from "../../models/filter";
import {formatDate} from "@angular/common";
import {MatDatepickerInputEvent} from "@angular/material/datepicker";
import {StoreDialogComponent} from "../store-dialog/store-dialog.component";
import {startOfHour} from "@fullcalendar/core/datelib/marker";

@Component({
	selector: 'kt-edit-entity-dialog',
	templateUrl: './edit-entity-dialog.component.html',
	styleUrls: ['./edit-entity-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.Default
})
export class EditEntityDialogComponent implements OnInit {
	private baseUrl = '/api';
	entity: any;
	entityForm: FormGroup;
	hasFormErrors = false;
	//model: any;
	//current: any;
	matcher = new EditEntityErrorStateMatcher();
	controls = {};
	option: any;
	filteredOptionss = {};
	utils = Utils;
	selected;
	period = '';
	loading$: Observable<boolean>;
	timer: any;
	leafletOptions: any;
	leafletLayers: any;
	leafletCenter: any;
	leaflet: any;
	multiSelectOptions: any;
	isSubmitted = false;
	currentLocation: any;
	@Input() current: any;
	@Input() model: any;
	@ViewChild(FileManagerToolComponent, undefined) fileManagerTool;
	files: any;
	description: string;
	inputFiles = [];
	lastquoteid: any;
	quotes1 = [];
	raporsay: any;
	raporsay2: any;
	lastquoteid2: any;
	quotes2 = [];
	raporsay3: any;
	raporsay4: any;
	input1: string;
	sonid: any;
	deneme: boolean;
	gizlilik: boolean;
	gizlilik2: boolean;
	isButtonClicked = false;
	dialog2: any;

	constructor(
		private cdr: ChangeDetectorRef,
		public dialogRef: MatDialogRef<any>,
		public dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private formBuilder: FormBuilder,
		public snackBar: MatSnackBar,
		public baseService: BaseService,
		private modalService: NgbModal,
		private dateAdapter: DateAdapter<Date>,
		private http: HttpClient,
		private httpUtils: HttpUtilsService
	) {
		this.loading$ = this.baseService.loadingSubject.asObservable();

		this.dateAdapter.setLocale('tr');
		this.dateAdapter.getFirstDayOfWeek = () => 1;
	}

	ngOnInit() {
		this.entity = this.data.entity;
		this.gizlilik = false;
		this.gizlilik2 = false;
		this.model = this.data.model;
		this.current = this.data.current;
		this.model = JSON.parse(JSON.stringify(this.data.model));
		this.createForm();
	}
	createForm() {
		const formFields = {};
		for (const field of this.model.fields) {
			if (field.name === 'customer' && !this.baseService.getPermissionRule('Customer', 'read')) {
				field.readOnly = true;
			} else if (field.name === 'office' && !this.baseService.getPermissionRule('Office', 'read')) {
				field.readOnly = true;
			}
			if (field.fieldType === 'time') {
				formFields[field.name + 'Hour'] = [{ value: this.valueFormat(field, 'Hour'), disabled: field.readOnly }, this.makeValidators(field, 'Hour')];
				formFields[field.name + 'Minute'] = [{ value: this.valueFormat(field, 'Minute'), disabled: field.readOnly }, this.makeValidators(field, 'Minute')];
				formFields[field.name] = [{ value: this.valueFormat(field), disabled: field.readOnly }, this.makeValidators(field)];
			} else {
				formFields[field.name] = [{ value: this.valueFormat(field), disabled: field.readOnly }, this.makeValidators(field)];
			}
		}
		this.entityForm = this.formBuilder.group(formFields, { validator: this.customValidationFunction.bind(this) });
	}


	customValidationFunction() {
		let customerOrOffice = false;
		return customerOrOffice ? { customerOrOffice } : null;
	}

	valueFormat(field, subType?) {
		const value = this.entity[field.name];

		if (field.attribute && field.attribute === 'User.Type') {
			this.fieldChange(field, value, true);
		}

		if (field.fieldType === 'object') {
			return value ? value : field.defaultValue !== undefined ? field.defaultValue : undefined;
		} else if (field.fieldType === 'percentage' || field.fieldType === 'currency') {
			return value ? Utils.makeTurkish(value) : field.defaultValue !== undefined ? field.defaultValue : '';
		} else if (field.fieldType === 'select') {
			if (field.multiple) {
				if (value && value.length > 0) {
					const newValue = [];
					for (let val of value) {
						val = val.toString();
						newValue.push(val);
					}
					return newValue;
				}
				return value ? value : [];
			} else {
				return value ? value.id :
					field.defaultValue !== undefined && this.baseService.getAttrVal(field.defaultValue)
						? this.baseService.getAttrVal(field.defaultValue).id : '';
			}
		} else if (field.fieldType === 'date') {
			let date;
			if (value) { date = new Date(value); } else if (field.defaultValue === 'today') { date = new Date(); } else { return undefined; }
			return date;
		} else if (field.fieldType === 'time') {
			let date;
			if (value) { date = new Date(value); } else if (field.defaultValue === 'today') { date = new Date(); } else { return undefined; }

			if (subType === 'Hour') {
				// return date.getHours().toString().padStart(2, '0');
				return date.getHours();
			} else if (subType === 'Minute') {
				// return date.getMinutes().toString().padStart(2, '0');
				return date.getMinutes();
			}
			return date;
		} else if (field.fieldType === 'boolean') {
			if (field.defaultValue === 'true') {
				field.defaultValue = true;
			} else if (field.defaultValue === 'false') {
				field.defaultValue = false;
			}
			return value !== undefined ? value : (field.defaultValue !== undefined ? field.defaultValue : false);
		} else {
			return value ? value.toString() : field.defaultValue !== undefined ? field.defaultValue : '';
		}
	}

	makeValidators(field, subType?) {
		const validators = [];
		if (field.required) { validators.push(Validators.required); }
		if (field.fieldType === 'email') { validators.push(Validators.email); }
		if (field.fieldType === 'url') { validators.push(Validators.pattern); }
		if (field.fieldType === 'text' || field.fieldType === 'number') {
			validators.push(Validators.maxLength(field.length));
		}
		if (subType === 'Hour') {
			validators.push(Validators.min(8));
			validators.push(Validators.max(18));
		}
		if (subType === 'Minute') {
			validators.push(Validators.min(0));
			validators.push(Validators.max(59));
		}
		return validators;
	}

	prepareEntity(): any {
		const controls = this.entityForm.controls;
		const _entity: any = this.entity;
		for (const field of this.model.fields) {
			if (field.name === 'id' && !controls[field.name].value) {
			} else if (field.fieldType === 'currency' || field.fieldType === 'percentage') {
				_entity[field.name] = Utils.currency2Float(controls[field.name].value);
			} else if (field.fieldType === 'select') {
				_entity[field.name] = controls[field.name].value ? this.baseService.getAttrVal(controls[field.name].value) : undefined;
			} else if (field.fieldType === 'phone') {
				_entity[field.name] = controls[field.name].value;
			} else if (field.fieldType === 'iban') {
				_entity[field.name] = controls[field.name].value;
			} else if (field.fieldType === 'disabled') {
				_entity[field.name] = controls[field.name].value;
			} else if (field.fieldType === 'time') {
				if (controls[field.name].value === undefined) {
					_entity[field.name] = undefined;
				} else {
					const date = new Date(controls[field.name].value);
					if (controls[field.name + 'Hour'].value !== undefined) { date.setHours(controls[field.name + 'Hour'].value); } else { date.setHours(8); }
					if (controls[field.name + 'Minute'].value !== undefined) { date.setMinutes(controls[field.name + 'Minute'].value); } else { date.setMinutes(30); }
					_entity[field.name] = date;
				}
				if (_entity[field.name] === '') { _entity[field.name] = undefined; }
			} else if (field.fieldType === 'date') {
				_entity[field.name] = controls[field.name].value && controls[field.name].value !== '' ? Utils.dateFormatForApi(controls[field.name].value) : undefined;
			} else if (field.fieldType === 'boolean') {
				_entity[field.name] = controls[field.name].value !== undefined ? controls[field.name].value : false;
			} else if (field.fieldType === 'object') {
				_entity[field.name] = typeof controls[field.name].value === 'object' ? controls[field.name].value : undefined;
			} else {
				_entity[field.name] = controls[field.name].value;
			}
		}
		return _entity;
	}
	/*else if (field.fieldType === 'select') {
				if (field.name === 'Konular') {
					const values = this.baseService.getAttrVal(controls[field.name].value);
					_entity[field.name] = values ? this.sortByWeight(values) : undefined;
				} else {
					_entity[field.name] = controls[field.name].value ? this.baseService.getAttrVal(controls[field.name].value) : undefined;
				}
			}*/
	clearObjectSelect(field, input) {
		input.value = '';
		this.entityForm.controls[field.name].setValue(undefined);
	}
	onSubmit() {
		this.isButtonClicked = true;
		this.checkObjectsValidity();
		this.isSubmitted = true;
		this.baseService.loadingSubject.next(true);
		this.hasFormErrors = false;
		const controls = this.entityForm.controls;
		if (this.entityForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.isButtonClicked = false;
			this.baseService.loadingSubject.next(false);
			return;
		}
		this.updateEntity(this.prepareEntity());
	}
	loadList() {
		if (this.model !== undefined) {
			this.baseService.find({}, this.model.apiName + '/file-list?entityId=' + this.current.id).subscribe(res2 => {
				this.files = res2.body;
			});
		} else {
			this.baseService.find({entityName: 'Generic', entityId: 0}, 'File/GetFileList').subscribe(res2 => {
				this.files = res2.body.result;
			});
		}
	}

	onSubmitAnother() {
		/*const customer = this.entityForm.controls['customer'].value;
		const cost = this.entityForm.controls['cost'].value;

		// Responsible tablosunda customer ve maliyet eşleştirme işlemleri yapılır
		const responsible = this.responsibleService.findMatchingResponsible(customer, cost);

		if (responsible && responsible.priority === 'Res_Onc_1') {
			const matchedOwner = this.responsibleService.findMatchingOwner(responsible.customer, responsible.cost, 'Res_Onc_2');
			if (matchedOwner) {
				this.entityForm.controls['owner'].setValue(matchedOwner.owner);
			}
		}*/

		// Diğer submit işlemleri burada devam eder...
	}

	prepareUpload(e) {
		this.inputFiles = e.target.files;
	}

	upload() {
		if (this.inputFiles.length === 0) { return; }
		let httpHeaders = this.httpUtils.getHTTPHeaders();
		httpHeaders = httpHeaders.delete('Content-Type');

		let formData = new FormData();
		formData.append('file', this.inputFiles[0]);
		formData.append('entityId', this.current.id);
		formData.append('description', this.description);

		this.http.put('/api/' + this.model.apiName + '/file-upload', formData, {headers: httpHeaders}).subscribe((val) => {
			this.description = undefined;
			this.inputFiles = [];
			Utils.showActionNotification('Başarı ile Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
			this.loadList();
		});
	}

	download(row, e) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post('api/' + this.model.apiName + '/file-download?fileId=' + row.id, {}, {headers: httpHeaders, responseType: 'blob', observe: 'response'})
			.pipe(
				tap(res => {
					let filename = '';
					const disposition = res.headers.get('Content-Disposition');
					if (disposition && disposition.indexOf('attachment') !== -1) {
						const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
						const matches = filenameRegex.exec(disposition);
						if (matches != null && matches[1]) {
							filename = matches[1].replace(/['"]/g, '');
						}
					}

					Utils.downloadFile(res.body, undefined, filename);
				}),
				catchError(err => {
					return err;
				})
			).subscribe();
	}

	delete(row, e) {
		this.baseService.delete(row.id, this.model.apiName + '/file-delete').subscribe(res2 => {
			Utils.showActionNotification('Dosya silindi', 'success', 10000, true, false, 3000, this.snackBar);
		});
	}
	checkObjectsValidity() {
		const controls = this.entityForm.controls;
		Object.keys(controls).forEach(controlName => {
			const field = Utils.getField(this.model.fields, controlName);
			const value = controls[controlName].value;
			if (field && field.fieldType === 'object' && field.required) {
				if (value && !value.id) {
					// this.entityForm.setErrors({ required: true });
					controls[controlName].setErrors({ required: true });
				}
			}
		});
	}

	updateEntity(_entity: any) {
		this.baseService.update(_entity, this.model.apiName).subscribe(
			(res) => {
				this.isButtonClicked = false;
				this.dialogRef.close({
					_entity,
					isEdit: true
				});
			}
		);
		const checkCondition$ = interval(1000) // Her saniye kontrol et
			.pipe(
				takeWhile(() => this.baseService.dialog2 === true) // Koşul sağlandığı sürece devam et
			);
		this.isButtonClicked = false;
		console.log('İçerde - Edit Entity');
		if (this.model.apiName === 'quotes') {
			const filters = new Set();
			filters.add({
				name: 'owner.id',
				operator: 'EQUALS',
				value: this.baseService.getUser().id
			});
			const queryParams = new QueryParamsModel(
				Utils.makeFilter(filters),
				[{sortBy: 'createdDate', sortOrder: 'ASC'}],
				0,
				100
			);
			this.baseService.find(queryParams, 'quotes').subscribe(res => {
				this.quotes1 = [];
				this.lastquoteid = null;
				this.raporsay = 0;
				for (const quo of res.body) {
					this.quotes1.push({
						id: quo.id
					});
					this.raporsay++;
				}
			});
			/*interval(10).pipe(
				concatMap(() => {
					return this.baseService.find(queryParams, 'quotes');
				})
			).subscribe(res => {
				this.quotes1 = [];
				this.lastquoteid = null;
				this.raporsay2 = 0;
				for (const quo of res.body) {
					this.quotes1.push({
						id: quo.id
					});
					this.raporsay2++;
				}
				if (this.quotes1.length > 0 && this.raporsay2 === this.raporsay) {
					this.lastquoteid = this.quotes1[this.quotes1.length - 1].id;
					this.current = {id: this.lastquoteid};
					//this.current = {id : 'ca9bc3c0-9848-4c35-81df-95d464a00a1d'};
					this.model = {apiName: 'quotes', endpoint: 'file-list', entityId: this.current};
					const dialogRef = this.dialog.open(FileManagerDialogComponent, {
						width: '800px',
						data: {current: this.current, model: this.model}
					});
					dialogRef.afterClosed().subscribe(() => {
						this.loadList();
					});
				}
			});*/
		}
	}
	onAlertClose() {
		this.hasFormErrors = false;
	}

	fieldChange(field: any, e, manualTrigger?) {
		if (field.name === 'productGroup') {
			if (this.entityForm.controls.product) { this.entityForm.controls.product.reset(); }
		} else if (field.attribute && field.attribute === 'User.Type') {
			if (this.baseService.getAttrVal(e).label === 'Kullanıcı Grubu') {
				for (const modelField of this.model.fields) {
					if (modelField.name === 'surname' || modelField.name === 'userName') {
						modelField.readOnly = true;
						modelField.required = false;
					}
				}
				this.entity['typeId'] = e;
			} else {
				this.model = JSON.parse(JSON.stringify(this.data.model));
				this.entity['typeId'] = e;
			}
			if (!manualTrigger) { this.createForm(); }
		} else if (field.name === 'city') {
			if (this.entityForm.controls.city.value && this.entityForm.controls.city.value.id) { this.entityForm.controls.district.reset(); }
		}
	}

	filterOptions(field: any, value: any) {
		this.filteredOptionss[field.name] = [];
		if (this.timer) {
			clearTimeout(this.timer);
		}
		/*if (field.name !== 'district' && field.name !== 'city' && !(value.length > 0)) { return; }
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
				console.log(this.filteredOptionss);
			});*/
		if (field.name !== 'iban' && field.name !== 'customer' && !(value.length > 0)) { return; }
		this.timer = setTimeout(function () {
			const filters = new Set();
			if (value && value.length >= 0) {
				filters.add({
					name: 'instanceName',
					operator: 'CONTAINS',
					value
				});
			}
			if (field.name === 'iban') {
				filters.add({
					name: 'customer.id',
					operator: 'EQUALS',
					value: this.entityForm.controls.customer.value ? this.entityForm.controls.customer.value.id : null
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
				console.log(this.filteredOptionss);
			});
		}.bind(this), 500);
		if (field.name === 'type' && value !== 'Iz_Tur_Maz' && this.model.apiName === 'holidays') {
			// Time nesnelerini kaldır veya gizle
			this.entityForm.get('startDate' + 'Hour').disable();
			this.entityForm.get('startDate' + 'Hour').setValue('8');
			this.entityForm.get('startDate' + 'Minute').disable();
			this.entityForm.get('startDate' + 'Minute').setValue('30');

			this.entityForm.get('endDate' + 'Hour').disable();
			this.entityForm.get('endDate' + 'Hour').setValue('8');
			this.entityForm.get('endDate' + 'Minute').disable();
			this.entityForm.get('endDate' + 'Minute').setValue('30');

			/*this.entityForm.get('comeDate' + 'Hour').disable();
			this.entityForm.get('comeDate' + 'Hour').setValue('8');
			this.entityForm.get('comeDate' + 'Minute').disable();
			this.entityForm.get('comeDate' + 'Hour').setValue('30');*/
			return;
		} else if (field.name === 'paymentStyle' && value === 'Payment_Style_Tl' && this.entityForm.get('moneyType').value === 'Par_Bir_Dl' && (this.model.apiName === 'invoice_lists' || this.model.apiName === 'payment_orders')) {
			this.gizlilik = true;
			this.gizlilik2 = true;
		} else if (field.name === 'paymentStyle' && value === 'Payment_Style_Doviz' && (this.model.apiName === 'invoice_lists' || this.model.apiName === 'payment_orders')) {
			this.gizlilik = false;
			this.gizlilik2 = false;
		}
		if (field.name === 'type' && value !== 'Iz_Tur_Maz' && this.model.apiName === 'holidays') {
			// Time nesnelerini kaldır veya gizle
			this.entityForm.get('startDate' + 'Hour').disable();
			this.entityForm.get('startDate' + 'Hour').setValue('8');
			this.entityForm.get('startDate' + 'Minute').disable();
			this.entityForm.get('startDate' + 'Minute').setValue('30');

			this.entityForm.get('endDate' + 'Hour').disable();
			this.entityForm.get('endDate' + 'Hour').setValue('8');
			this.entityForm.get('endDate' + 'Minute').disable();
			this.entityForm.get('endDate' + 'Minute').setValue('30');

			/*this.entityForm.get('comeDate' + 'Hour').disable();
			this.entityForm.get('comeDate' + 'Hour').setValue('8');
			this.entityForm.get('comeDate' + 'Minute').disable();
			this.entityForm.get('comeDate' + 'Hour').setValue('30');*/
			return;
		} else if (field.name === 'type' && value === 'Iz_Tur_Maz' && this.model.apiName === 'holidays') {
			this.entityForm.get('startDate' + 'Hour').enable();
			this.entityForm.get('startDate' + 'Minute').enable();

			this.entityForm.get('endDate' + 'Hour').enable();
			this.entityForm.get('endDate' + 'Minute').enable();
		}
		/*if (field.name === 'birim' && this.model.apiName === 'tasks') {
			this.entityForm.get('type').reset();
		}*/
	}

	fieldChangeTime(field: any, value: any) {
		this.filteredOptionss[field.name] = [];
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.entityForm.get('startDate' + 'Hour').disable();
		this.entityForm.get('startDate' + 'Hour').setValue('8');
		this.entityForm.get('startDate' + 'Minute').disable();
		this.entityForm.get('startDate' + 'Minute').setValue('30');

		this.entityForm.get('endDate' + 'Hour').disable();
		this.entityForm.get('endDate' + 'Hour').setValue('8');
		this.entityForm.get('endDate' + 'Minute').disable();
		this.entityForm.get('endDate' + 'Minute').setValue('30');

		this.entityForm.get('birthDate' + 'Hour').disable();
		this.entityForm.get('birthDate' + 'Hour').setValue('8');
		this.entityForm.get('birthDate' + 'Minute').disable();
		this.entityForm.get('birthDate' + 'Minute').setValue('30');
		return;
	}



	objectDisplay(field, option) {
		return option ? option['instanceName'] : option;
	}

	checkInOrOut(isCheckIn) {
		if (navigator.geolocation) {
			const options = { timeout: 60000 };
			navigator.geolocation.getCurrentPosition
			(this.checkSave.bind(this, isCheckIn), this.geoLocationErrorHandler.bind(this), options);
		} else {
			this.geoLocationErrorHandler.bind(this);
		}
		// this.entityForm.controls.checkInTime.setValue(new Date().toISOString().substr(0, 10));
		// this.entityForm.controls.checkInTimeHour.setValue(new Date().getHours());
		// this.entityForm.controls.checkInTimeMinute.setValue(new Date().getMinutes());
	}

	geoLocationErrorHandler() {
		Utils.showActionNotification('Konum Bilgisine Erişilemedi Ancak İşleme Devam Edebilirsiniz', 'warning', 10000, true, true, 3000, this.snackBar);
	}

	setLocation(isCheckIn, position) {
		if (isCheckIn) {
			this.entityForm.controls.checkInLatitude.setValue(position.coords.latitude);
			this.entityForm.controls.checkInLongitude.setValue(position.coords.longitude);
		} else {
			this.entityForm.controls.checkOutLatitude.setValue(position.coords.latitude);
			this.entityForm.controls.checkOutLongitude.setValue(position.coords.longitude);
		}
	}

	checkSave(isCheckIn, position) {
		const _checkInData = {
			id: this.entity.id,
			checkInLatitude: isCheckIn ? position.coords.latitude : undefined,
			checkInLongitude: isCheckIn ? position.coords.longitude : undefined,
			checkOutLatitude: !isCheckIn ? position.coords.latitude : undefined,
			checkOutLongitude: !isCheckIn ? position.coords.longitude : undefined
		};
		this.baseService.update(_checkInData, 'Activity/' + (isCheckIn ? 'CheckIn' : 'CheckOut')).subscribe((res) => {
			if (res.result.length === 1) {
				const result = res.result[0];
				if (isCheckIn) {
					this.entityForm.controls.checkInTime.setValue(new Date(result.checkInTime));
					this.entityForm.controls.checkInTimeHour.setValue(new Date(result.checkInTime).getHours().toString().padStart(2, '0'));
					this.entityForm.controls.checkInTimeMinute.setValue(new Date(result.checkInTime).getMinutes().toString().padStart(2, '0'));
					this.entityForm.controls.checkInLatitude.setValue(result.checkInLatitude);
					this.entityForm.controls.checkInLongitude.setValue(result.checkInLongitude);
				} else {
					this.entityForm.controls.checkOutTime.setValue(new Date(result.checkOutTime));
					this.entityForm.controls.checkOutTimeHour.setValue(new Date(result.checkOutTime).getHours().toString().padStart(2, '0'));
					this.entityForm.controls.checkOutTimeMinute.setValue(new Date(result.checkOutTime).getMinutes().toString().padStart(2, '0'));
					this.entityForm.controls.checkOutLatitude.setValue(result.checkOutLatitude);
					this.entityForm.controls.checkOutLongitude.setValue(result.checkOutLongitude);
					this.entityForm.controls.statusId.setValue(result.statusId);
				}
			}
		});
	}

	leafletLocateOnMap(modal) {
		if (this.entityForm.controls.latitude.value && this.entityForm.controls.longitude.value) {
			this.leafletShowMap(modal, { coords: { latitude: this.entityForm.controls.latitude.value, longitude: this.entityForm.controls.longitude.value } });
		} else if (navigator.geolocation) {
			const options = { timeout: 60000 };
			navigator.geolocation.getCurrentPosition
			(this.leafletShowMap.bind(this, modal), this.geoLocationErrorHandler.bind(this), options);
		} else {
			Utils.showActionNotification('Konum Erişiminiz Kontrol Ediniz', 'warning', 10000, true, false, 3000, this.snackBar);
		}
	}

	leafletShowMap(modal, position) {
		this.leafletOptions = {
			layers: [
				L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
			],
			zoom: 7,
			center: L.latLng(position.coords.latitude, position.coords.longitude)
		};

		this.leafletLayers = [L.marker([position.coords.latitude, position.coords.longitude], {
			icon: L.icon({
				iconSize: [25, 41],
				iconAnchor: [13, 41],
				iconUrl: 'assets/marker-icon.png',
				shadowUrl: 'assets/marker-shadow.png'
			})
		})];

		this.leafletCenter = L.latLng(position.coords.latitude, position.coords.longitude);

		this.currentLocation = position.coords;

		if (modal) {
			this.modalService.open(modal, {
				size: 'lg'
			});
		} else {
			this.entityForm.controls.latitude.setValue(this.currentLocation.latitude);
			this.entityForm.controls.longitude.setValue(this.currentLocation.longitude);
		}
	}

	leafletOnMapReady(map: L.Map) {
		this.leaflet = map;
		map.doubleClickZoom.disable();
	}

	leafletDoubleClick(e) {
		this.leafletLayers = [L.marker([e.latlng.lat, e.latlng.lng], {
			icon: L.icon({
				iconSize: [25, 41],
				iconAnchor: [13, 41],
				iconUrl: 'assets/marker-icon.png',
				shadowUrl: 'assets/marker-shadow.png'
			})
		})];
		this.leafletCenter = L.latLng(e.latlng.lat, e.latlng.lng);
		this.entityForm.controls.latitude.setValue(e.latlng.lat);
		this.entityForm.controls.longitude.setValue(e.latlng.lng);
	}

	useCurrentLocation() {
		if (navigator.geolocation) {
			const options = { timeout: 60000 };
			navigator.geolocation.getCurrentPosition
			(this.leafletShowMap.bind(this, undefined), this.geoLocationErrorHandler.bind(this), options);
		}
	}

	approve() {
		if (this.entityForm.controls.approvalStatusId &&
			Utils.makeIntegers(this.entityForm.controls.approvalStatusId.value) === this.baseService.getAttrByVal('Activity.ApprovalStatus', 'Onay Bekliyor').id) {
			this.entityForm.controls.approvalStatusId.setValue(this.baseService.getAttrByVal('Activity.ApprovalStatus', 'Onaylandı').id);
			this.onSubmit();
		}
	}

	reject() {
		if (this.entityForm.controls.approvalStatusId &&
			Utils.makeIntegers(this.entityForm.controls.approvalStatusId.value) === this.baseService.getAttrByVal('Activity.ApprovalStatus', 'Onay Bekliyor').id) {
			this.entityForm.controls.approvalStatusId.setValue(this.baseService.getAttrByVal('Activity.ApprovalStatus', 'Reddedildi').id);
			this.onSubmit();
		}
	}
	onSendAnother() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = this.entityForm.controls.id.value;
		const status = this.baseService.getAttrVal('Fatura_Durumlari_Muhasebe').id;
		const description = this.baseService.getUserFullName() + ' tarafından geri gönderildi. ' + this.entityForm.controls.description.value;
		console.log(id + ' - ' + status + ' - ' + description);
		const url = `api/invoice_lists/${id}?status=${status}&description=${description}`;
		//`?receiver=${receiver}&subject=${subject}&message=${message}`
		// PUT isteği gönderme
		this.http.put(url, null, { headers: httpHeaders})
			.subscribe(
				() => {
					this.dialogRef.close({
					});
				},
				(error) => {
					console.error('Hata:', error);
				}
			);
	}
	onSendRepeat() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = this.entityForm.controls.id.value;
		const status = this.baseService.getAttrVal('Fatura_Durumlari_Mukerrer').id;
		const description = this.baseService.getUserFullName() + ' tarafından mükerrer fatura olduğu belirtildi. ' + this.entityForm.controls.description.value;
		console.log(id + ' - ' + status + ' - ' + description);
		const url = `api/invoice_lists/${id}?status=${status}&description=${description}`;
		//`?receiver=${receiver}&subject=${subject}&message=${message}`
		// PUT isteği gönderme
		this.http.put(url, null, { headers: httpHeaders})
			.subscribe(
				() => {
					this.dialogRef.close({
					});
				},
				(error) => {
					console.error('Hata:', error);
				}
			);
	}
	onSendCancel() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const id = this.entityForm.controls.id.value;
		const status = this.baseService.getAttrVal('Fatura_Durumlari_Iptal').id;
		const description = this.baseService.getUserFullName() + ' tarafından iptal fatura olduğu belirtildi. ' + this.entityForm.controls.description.value;
		const url = `api/invoice_lists/${id}?status=${status}&description=${description}`;
		//`?receiver=${receiver}&subject=${subject}&message=${message}`
		// PUT isteği gönderme
		this.http.put(url, null, { headers: httpHeaders})
			.subscribe(
				() => {
					this.dialogRef.close({
					});
				},
				(error) => {
					console.error('Hata:', error);
				}
			);
	}
}

export class EditEntityErrorStateMatcher implements ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		const isSubmitted = form && form.submitted;
		return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
	}
}
