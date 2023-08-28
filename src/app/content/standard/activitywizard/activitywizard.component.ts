import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar, MatDialog, MatBottomSheet } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Utils } from '../../_base/utils';
import { Observable } from 'rxjs';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { ContinueConfirmComponent } from '../../_base/dialogs/continue-confirm/continue-confirm.component';

@Component({
	selector: 'kt-activitywizard',
	templateUrl: './activitywizard.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['./activitywizard.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ActivityWizardComponent implements OnInit, AfterViewInit {

	@ViewChild('wizard', { static: true }) el: ElementRef;

	data;
	utils = Utils;
	loading$: Observable<boolean>;
	filteredOptionss = {};
	timer: any;
	lead;

	constructor(
		private cdr: ChangeDetectorRef,
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver,
		private bottomSheet: MatBottomSheet,
	) {
		this.initData();

		const data = JSON.parse(localStorage.getItem('quickActivity'));

		if (data) {
			this.bottomSheet.open(ContinueConfirmComponent).afterDismissed().subscribe((doIt) => {
				if (doIt) {
					this.data = data;
					this.initWizard(this.data.currentStep ? this.data.currentStep : 1);
					this.cdr.markForCheck();
				} else {
					localStorage.removeItem('quickActivity');
					this.initWizard(1);
				}
			});
		} else {
			setTimeout(() => {
				this.initWizard(1);
			}, 0);
		}

		this.loading$ = this.baseService.loadingSubject.asObservable();
	}

	ngOnInit() {
		this.route.queryParams.subscribe(params => {
			if (params.lead) {
				this.lead = JSON.parse(params.lead);

				this.data.lead = this.lead;
				this.data.customer.name = this.lead.name;
				this.data.customer.phone = this.lead.phone;
				this.cdr.markForCheck();
			}
		});
	}

	ngAfterViewInit() {
	}

	initWizard(currentStep) {
		// Initialize form wizard

		const wizard = new KTWizard(this.el.nativeElement, {
			startStep: currentStep
		});

		// Validation before going to next page
		wizard.on('beforeNext', function (wizardObj) {
			// https://angular.io/guide/forms
			// https://angular.io/guide/form-validation

			// validate the form and use below function to stop the wizard's step
			// wizardObj.stop();
		});

		// Change event
		wizard.on('change', function (wizardObj) {
			setTimeout(function () {
				this.data.currentStep = wizardObj.currentStep;
				this.cdr.markForCheck();
				KTUtil.scrollTop();
			}.bind(this), 0);
		}.bind(this));
	}

	initData() {
		this.data = {
			activity: {
				type: Utils.hasOperation('Back_Office') ? undefined : this.baseService.getAttrVal('Akt_Tip_Firma_Ziyareti'),
				description: '',
				checkInLatitude: undefined,
				checkInLongitude: undefined,
				checkOutLatitude: undefined,
				checkOutLongitude: undefined,
				checkInTime: undefined,
				checkOutTime: undefined,
			},
			quote: {
				fuelLt: undefined,
				fuelTl: undefined,
				discountGasoline: undefined,
				discountDiesel: undefined,
				paymentPeriod: this.baseService.getAttrVal('Söz_ÖdP_Aylık'),
				//paymentMethod: this.baseService.getAttrVal('Söz_ÖdY_DBS'),
				probability: undefined,
				paymentDay: 10,
			},
			task: {
				owner: undefined,
				description: '',
			},
			createContract: false
		};

		this.initCustomer();
	}

	initCustomer() {
		this.data.customer = {
			name: '',
			phone: '',
			email: '',
			vehicleCount: undefined,
			sector: undefined,
		};
		this.data.oldCustomer = {
			instanceName: '',
			name: '',
			phone: '',
			email: '',
			vehicleCount: undefined,
			sector: undefined,
		};

		this.initAddress();
		this.initContact();
	}

	initAddress() {
		this.data.address = {
			name: '',
			detail: '',
			city: undefined,
			district: undefined
		};
		this.data.oldAddress = {
			instanceName: '',
			name: '',
			detail: '',
			city: undefined,
			district: undefined
		};
	}

	initContact() {
		this.data.contact = {
			firstName: '',
			lastName: '',
			phone: '',
			email: '',
			type: undefined,
		};
		this.data.oldContact = {
			instanceName: '',
			firstName: '',
			lastName: '',
			phone: '',
			email: '',
			type: undefined,
		};
	}

	customerTabChange(e) {
		if (e.index === 0) {
			this.initCustomer();
		}
	}

	addressTabChange(e) {
		if (e.index === 0) {
			this.initAddress();
		}
	}

	contactTabChange(e) {
		if (e.index === 0) {
			this.initContact();
		}
	}

	checkInOrOut(isCheckIn, customerSite) {
		if (isCheckIn) { this.data.customerSite = customerSite; }
		if (this.data.customerSite) {
			if (navigator.geolocation) {
				const options = { timeout: 60000 };
				navigator.geolocation.getCurrentPosition
					(this.setLocation.bind(this, isCheckIn), this.geoLocationErrorHandler.bind(this), options);
			} else {
				this.geoLocationErrorHandler.bind(this);
			}
		} else {
			if (isCheckIn) {
				this.data.activity.checkInTime = new Date().toISOString();
				this.dataChanged();
				this.cdr.markForCheck();
			} else {
				this.data.activity.checkOutTime = new Date().toISOString();
				this.onSubmit();
			}
		}
	}

	geoLocationErrorHandler(err) {
		Utils.showActionNotification('Konum Bilgisine Erişilemedi', 'warning', 10000, true, true, 3000, this.snackBar);
	}

	setLocation(isCheckIn, position) {
		if (isCheckIn) {
			this.data.activity.checkInLatitude = position.coords.latitude;
			this.data.activity.checkInLongitude = position.coords.longitude;
			this.data.activity.checkInTime = new Date().toISOString();
			this.dataChanged();
			this.cdr.markForCheck();
		} else {
			this.data.activity.checkOutLatitude = position.coords.latitude;
			this.data.activity.checkOutLongitude = position.coords.longitude;
			this.data.activity.checkOutTime = new Date().toISOString();
			this.onSubmit();
		}
	}

	onSubmit() {
		this.baseService.loadingSubject.next(true);
		const data = this.prepareData();
		if (
			data.createContract &&
			(!data.customer.name || data.customer.name === '' ||
				!data.customer.email || data.customer.email === '' ||
				!data.customer.phone || data.customer.phone === '' ||
				!data.address.detail || data.contact.detail === '' ||
				!data.contact.firstName || data.contact.firstName === '')
		) {
			Utils.showActionNotification('Firma unvanı, adres, email, telefon ve yetkili kişi bilgileri zorunludur', 'warning', 10000, true, false, 3000, this.snackBar);
			this.baseService.loadingSubject.next(false);
			return;
		}
		if (!Utils.hasOperation('Back_Office') && !data.contact.firstName && !data.oldContact.firstName) {
			Utils.showActionNotification('Yetkili kişi bilgisi zorunludur', 'warning', 10000, true, false, 3000, this.snackBar);
			this.baseService.loadingSubject.next(false);
			return;
		}
		this.baseService.update(data, 'dashboards/quick-activity').subscribe(() => {
			Utils.showActionNotification('Başarı ile Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);

			this.baseService.loadingSubject.next(false);

			localStorage.removeItem('quickActivity');

			this.router.navigate(['/']);
		});
	}

	prepareData() {
		const data = JSON.parse(JSON.stringify(this.data));
		data.customer = data.oldCustomer.id ? data.oldCustomer : data.customer;
		data.address = data.oldAddress.id ? data.oldAddress : data.address;
		data.contact = data.oldContact.id ? data.oldContact : data.contact;
		data.quote.discountGasoline = Utils.currency2Float(data.quote.discountGasoline);
		data.quote.discountDiesel = Utils.currency2Float(data.quote.discountDiesel);
		data.quote.fuelTl = Utils.currency2Float(data.quote.fuelTl);
		if (data.task.dueTime) {
			const date = new Date(data.task.dueTime);
			if (data.task.dueTimeHour !== undefined) { date.setHours(data.task.dueTimeHour); } else { date.setHours(0); }
			if (data.task.dueTimeMinute !== undefined) { date.setMinutes(data.task.dueTimeMinute); } else { date.setMinutes(0); }
			data.task.dueTime = date;
		}
		return data;
	}

	sendInfo() {
		this.baseService.loadingSubject.next(true);

		this.baseService.update(this.prepareData(), 'dashboards/sendInfoDocument').subscribe(() => {
			Utils.showActionNotification('Başarı ile Gönderildi', 'success', 10000, true, false, 3000, this.snackBar);

			this.baseService.loadingSubject.next(false);
		});
	}

	sendContract() {
		this.baseService.loadingSubject.next(true);

		this.baseService.update(this.prepareData(), 'dashboards/sendContractDocument').subscribe(() => {
			Utils.showActionNotification('Başarı ile Gönderildi', 'success', 10000, true, false, 3000, this.snackBar);

			this.baseService.loadingSubject.next(false);
		});
	}

	filterOptions(field: any, value: any) {
		this.filteredOptionss[field.name] = [];
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = setTimeout(function () {
			const filters = new Set();
			if (value.length >= 0) {
				filters.add({
					name: 'instanceName',
					operator: 'CONTAINS',
					value
				});
			}
			if (field.name === 'Contact') {
				filters.add({
					name: 'customer.id',
					operator: 'EQUALS',
					value: this.data.oldCustomer.id
				});
			}
			if (field.name === 'Address') {
				filters.add({
					name: 'customer.id',
					operator: 'EQUALS',
					value: this.data.oldCustomer.id
				});
			}
			if (field.name === 'District') {
				filters.add({
					name: 'city.id',
					operator: 'EQUALS',
					value: this.data.oldAddress.id ? this.data.oldAddress.city.id : this.data.address.city.id
				});
			}
			const queryParams = new QueryParamsModel(
				Utils.makeFilter(filters),
				[{ sortBy: field.displayField, sortOrder: 'ASC' }],
				0,
				100
			);

			this.baseService.find(queryParams, field.apiName).subscribe(res => {
				this.filteredOptionss[field.name] = res.body;
				this.cdr.markForCheck();
			});
		}.bind(this), 500);

		if (field.name === 'Customer' && this.data.oldCustomer && this.data.oldCustomer.id) {
			this.initContact();
			this.initAddress();
		}
	}

	objectDisplay(option) {
		return option ? (option.instanceName !== undefined ? option.instanceName : option) : '';
	}

	dataChanged() {
		localStorage.setItem('quickActivity', JSON.stringify(this.data));
	}

	customerSelected() {
		this.getSingleAddress();
		this.getSingleContact();
	}

	getSingleAddress() {
		const filters = new Set();
		filters.add({
			name: 'customer.id',
			operator: 'EQUALS',
			value: this.data.oldCustomer.id
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			undefined,
			0,
			100
		);

		this.baseService.find(queryParams, 'addresses').subscribe(res => {
			if (res.body.length === 1) {
				this.data.oldAddress = res.body[0];
				this.cdr.markForCheck();
			}
		});
	}

	getSingleContact() {
		const filters = new Set();
		filters.add({
			name: 'customer.id',
			operator: 'EQUALS',
			value: this.data.oldCustomer.id
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			undefined,
			0,
			100
		);

		this.baseService.find(queryParams, 'contacts').subscribe(res => {
			if (res.body.length === 1) {
				this.data.oldContact = res.body[0];
				this.cdr.markForCheck();
			}
		});
	}
}
