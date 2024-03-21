import {
	Component,
	OnInit,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
	ViewChild,
	ViewEncapsulation,
	Input
} from '@angular/core';
import { LayoutConfigService } from '../../../core/_base/layout';
import { BaseService } from '../../_base/base.service';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { Utils } from '../../_base/utils';
import { FilterOperation } from '../../_base/models/filter';
import { formatDate } from '@angular/common';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {HttpUtilsService} from '../../_base/http-utils.service';
import {BaseComponent} from '../../_base/base.component';
import {MatDialog} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {EditEntityDialogComponent} from '../../_base/dialogs/edit-entity-dialog/edit-entity-dialog.component';
import {PaymentOkeyComponent} from '../../_base/dialogs/payment-okey-dialog/payment-okey.component';

@Component({
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent extends BaseComponent implements OnInit {
	@ViewChild('salesWidget', undefined) salesWidget;
	announcements = [];
	tasks = [];
	usersContact = [];
	usersBirth = [];
	bubbleObject: any;
	bubbleModel: any;

	paymentStat = 'VERİLER YÜKLENİYOR...';

	taskyeni;
	taskdevam;
	taskred;
	tasktamam;

	activityWidget1Data;
	activityWidget2Data;
	activityWidget3Data;
	activityWidget4Data;

	invoiceList = [];
	formList = [];
	paymentOrder = [];
	bekleyenList = [];
	holidayList = [];
	waitHolidayList = [];
	birthDayList = [];
	date = new Date();
	/*salesData = { totalDiesel: 0, totalGas: 0, total: 0, monthlyDiesel: 0, monthlyGas: 0, monthlyTotal: 0, datasets: [], labels: [], maxData: 1000 };*/
	pendingQuotes = [];
	chartYear = 2022;
	utils = Utils;
	@Input() defaultValues = [];

	constructor(
		private cdr: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService,
		public baseService: BaseService,
		public snackBar: MatSnackBar,
		public dialog: MatDialog,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('InvoiceList');
	}

	ngOnInit(): void {
		this.getFormList();
		this.getChangePage();
		// this.getCharts();
		this.getTasks();
		this.getTaskStatus();
		this.getCont();
		this.getInvoiceList();
		this.getPaymentOrder();
		this.getHolidayList();
		this.getWaitHolidayList();
		this.getBirthDay();

	}

	getChangePage() {
		if (this.baseService.getRoleId() === 'ROLE_MAVI') {
			this.router.navigate(['/holiday']);
		}
	}
	getFormList() {
		const filters = new Set();
		filters.add({
			name: 'assigner.id',
			operator: FilterOperation.EQUALS,
			value: this.baseService.getUserId()
		});
		filters.add({
			name: 'okeyDate',
			operator: FilterOperation.EQUALS,
			value: null
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
			0,
			50000
		);
		this.formList = [];
		this.baseService.find(queryParams, 'user_trial_forms').subscribe(res => {
			if (res) {
				this.formList = res.body;
			}
			this.cdr.markForCheck();
		});
		this.baseService.find(queryParams, 'user_evaluation_forms').subscribe(res2 => {
			if (res2) {
				this.formList = this.formList.concat(res2.body);
			}
			this.cdr.markForCheck();
		});
	}
	getInvoiceList() {
		if (!this.utils.hasOperation('FaturaListesi_Goruntuleme')) { return 0; }
		const filters = new Set();
		filters.add({
			name: 'owner.id',
			operator: FilterOperation.EQUALS,
			value: this.baseService.getUserId()
		});
		filters.add({
			name: 'invoiceStatus.id',
			operator: FilterOperation.EQUALS,
			value: 'Fatura_Durumlari_Atandi'
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
			0,
			50000
		);
		this.baseService.find(queryParams, 'invoice_lists').subscribe(res => {
			this.invoiceList = [];
			this.invoiceList = res.body;
			this.cdr.markForCheck();
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
		const dialogRef = this.dialog.open(EditEntityDialogComponent, {data: {entity, model: this.model}});
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				Utils.showActionNotification('Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
				this.getInvoiceList();
			}
		});
	}

	okeyPayment(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}

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
			Utils.showActionNotification('Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
			this.getPaymentOrder();
		});
	}
	cancelPayment(entity, e?, presetValues = []) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}

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
			Utils.showActionNotification('Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
			this.getPaymentOrder();
		});
	}

	changeHoliday(entity, e?, presetValues = [], approvalStatus?: string) {
		if (e) {
			e.stopPropagation();
		}
		for (const defaultValue of this.defaultValues) {
			entity[defaultValue.field] = defaultValue.value;
		}
		for (const p of presetValues) {
			entity[p.field] = p.value;
		}
		entity.approvalStatus = this.baseService.getAttrVal(approvalStatus);
		this.baseService.update(entity, 'holidays').subscribe(() => {
			Utils.showActionNotification('Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
			this.getWaitHolidayList();
		});
	}
	taskInfoClicked(row) {
		this.router.navigate(['/task'], { queryParams: { id: row.id, sourceObject: 'task', sourceId: row.id } });
	}
	getPaymentOrder() {
		if (!this.utils.hasOperation('Talimat_Goruntuleme')) {
			this.paymentStat = 'VERİLER YÜKLENDİ!';
			return 0;
		}
		const filters = new Set();
		const queryParams2 = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
			0,
			5000
		);

		this.baseService.find(queryParams2, 'payment_orders').subscribe(res => {
			this.paymentOrder = [];
			this.paymentOrder = res.body
				.filter(flt =>
					(flt.assigner.id === this.baseService.getUserId() && flt.status.id === 'Payment_Status_Bek1') ||
					(flt.secondAssigner.id === this.baseService.getUserId() && flt.status.id === 'Payment_Status_Bek2'))
				.map(item => {
					return {
						id: item.id,
						assigner: item.assigner,
						secondAssigner: item.secondAssigner,
						status: item.status,
						description: item.description,
						customer: item.customer,
						sirket: item.sirket,
						moneyType: item.moneyType,
						amount: item.amount,
						paymentSubject: item.paymentSubject
					};
				});
			this.paymentStat = 'VERİLER YÜKLENDİ!';
			this.cdr.markForCheck();
		});
	}
	getHolidayList() {
		const filters = new Set();
		filters.add({
			name: 'comeDate',
			operator: FilterOperation.GREATER_OR_EQUAL_THAN,
			value: new Date()
		});
		filters.add({
			name: 'startDate',
			operator: FilterOperation.LESS_OR_EQUAL_THAN,
			value: new Date()
		});
		filters.add({
			name: 'approvalStatus.id',
			operator: FilterOperation.EQUALS,
			value: 'Izin_Dur_Aktif'
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
			0,
			50000
		);
		queryParams.owner = 'HIERARCHY_D';
		this.baseService.find(queryParams, 'holidays').subscribe(res => {
			this.holidayList = [];
			for (const ivl of res.body) {
				this.holidayList.push({
					owner: ivl.owner.firstName + ' ' + ivl.owner.lastName,
					start: ivl.startDate,
					end: ivl.endDate,
					come: ivl.comeDate,
					tur: ivl.type.label
				});
			}
			this.cdr.markForCheck();
		});
	}
	getWaitHolidayList() {
		const filters = new Set();
		filters.add({
			name: 'assigner.id',
			operator: FilterOperation.EQUALS,
			value: this.baseService.getUserId()
		});
		filters.add({
			name: 'approvalStatus.id',
			operator: FilterOperation.EQUALS,
			value: 'Izin_Dur_Pasif'
		});
		const queryParams3 = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
			0,
			50000
		);
		this.baseService.find(queryParams3, 'holidays').subscribe(res => {
			this.waitHolidayList = [];
			this.waitHolidayList = res.body;
			this.paymentStat = 'VERİLER YÜKLENDİ!';
			this.cdr.markForCheck();
		});
	}
	getBirthDay() {
		const filters = new Set();
		filters.add({
			name: 'activated',
			operator: FilterOperation.EQUALS,
			value: true
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'birthDate', sortOrder: 'DESC' }],
			0,
			1000
		);
		this.baseService.find(queryParams, 'users').subscribe(res => {
			this.birthDayList = [];
			const today = new Date();
			const todayMonth = today.getMonth() + 1; // Ay 0'dan başlar, bu yüzden 1 ekleyin
			const todayDay = today.getDate();

			for (const ivl of res.body) {
				const birthDate = new Date(ivl.birthDate);
				const birthMonth = birthDate.getMonth() + 1; // Ay 0'dan başlar, bu yüzden 1 ekleyin
				const birthDay = birthDate.getDate();

				let daysLeft: number;

				if (todayMonth === birthMonth && todayDay === birthDay) {
					// Bugün doğum günü
					daysLeft = 0;
				} else if (
					todayMonth < birthMonth ||
					(todayMonth === birthMonth && todayDay < birthDay)
				) {
					// Henüz doğum günü gelmemiş
					const nextBirthday = new Date(
						today.getFullYear(),
						birthMonth - 1,
						birthDay
					);
					const timeDiff = nextBirthday.getTime() - today.getTime();
					daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
				} else {
					// Doğum günü bu yıl geçti, bir sonraki yılın doğum gününü hesapla
					const nextBirthday = new Date(
						today.getFullYear() + 1,
						birthMonth - 1,
						birthDay
					);
					const timeDiff = nextBirthday.getTime() - today.getTime();
					daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
				}
				// Sadece 15 günden az kalan ve yaş 1'den büyük olan kişileri listeye ekleyin
				if (daysLeft < 15) {
					this.birthDayList.push({
						adsoyad: ivl.firstName + ' ' + ivl.lastName,
						sirket: ivl.sirket.label,
						birim: ivl.birim.label,
						unvan: ivl.unvan.label,
						dogum: ivl.birthDate,
						kalan: daysLeft
					});
				}
			}

			// birthDayList'i kalan gün sayısına göre sıralayın
			this.birthDayList.sort((a, b) => a.kalan - b.kalan);

			// Değişiklikleri algıla
			this.cdr.markForCheck();
		});
	}
	formatDate(date: string): string {
		if (!date) { return ''; }

		const formattedDate = new Date(date);
		const day = ('0' + formattedDate.getDate()).slice(-2);
		const month = ('0' + (formattedDate.getMonth() + 1)).slice(-2);
		const year = formattedDate.getFullYear();

		return `${day}-${month}-${year}`;
	}
	formatBirthDate(date: string): string {
		if (!date) { return ''; }

		const formattedDate = new Date(date);
		const day = (formattedDate.getDate());
		const monthNames = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
		const month = monthNames[formattedDate.getMonth()];

		return `${day} ${month}`;
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
	getTasks() {
		const filters = new Set();
		filters.add({
			name: 'owner.id',
			operator: FilterOperation.EQUALS,
			value: this.baseService.getUserId()
		});
		filters.add({
			name: 'status.id',
			operator: FilterOperation.IN,
			value: ['Gör_Dur_Yeni', 'Gör_Dur_Devam_Ediyor']
		});
		const queryParams3 = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'dueTime', sortOrder: 'ASC' }],
			0,
			50000
		);
		this.baseService.find(queryParams3, 'tasks').subscribe(res => {
			this.tasks = [];
			this.tasks = res.body;
			this.cdr.markForCheck();
		});
	}
	getCont() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'siralama', sortOrder: 'ASC' }],
			0,
			300
		);
		this.baseService.find(queryParams, 'users').subscribe(res => {
			this.usersContact = [];
			for (const usr of res.body) {
				if (usr.siralama === '000' || usr.siralama === null || usr.activated === false ) { continue; }
				this.usersContact.push({
					icon: 'kt-font-success',
					sirket: usr.sirket.label,
					birim: usr.birim.label,
					unvan: usr.unvan.label,
					name: usr.firstName + ' ' + usr.lastName,
					phone: usr.phone,
					short_code: usr.short_code,
					email: usr.email,
					id: usr.id
				});
			}
			this.cdr.markForCheck();
		});
	}

	getBirth() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'siralama', sortOrder: 'ASC' }],
			0,
			100
		);
		this.baseService.find(queryParams, 'users').subscribe(res => {
			this.usersBirth = [];
			const currentDate = new Date(); // mevcut tarihi al
			for (const usr of res.body) {
				if (usr.siralama === null || usr.activated === false) { continue; }
				const birthDate = new Date(usr.birth_date); // kullanıcının doğum tarihini al
				birthDate.setFullYear(currentDate.getFullYear()); // yılını mevcut yıl olarak ayarla
				if (birthDate < currentDate && birthDate.getMonth() === currentDate.getMonth() && (currentDate.getDate() - birthDate.getDate()) <= 10) { // kontrolü yap
					this.usersBirth.push({
						icon: 'kt-font-success',
						sirket: usr.sirket.label,
						birim: usr.birim.label,
						unvan: usr.unvan.label,
						name: usr.firstName + ' ' + usr.lastName,
						birth_date: usr.birth_date,
						id: usr.id
					});
				}
			}
			this.cdr.markForCheck();
		});
	}
	getCharts() {
		this.baseService.find(undefined, 'dashboards?userId=' + this.baseService.getUserId() + '&year=' + this.chartYear).pipe(
			tap(res => {
				if (res.body.pendingQuotes) {
					this.pendingQuotes = res.body.pendingQuotes;
				}
				const color = Chart.helpers.color;
				this.activityWidget1Data = {
					labels: [],
					datasets: [
						{
							label: 'Yeni',
							fill: false,
							borderWidth: 2,
							borderColor: color(this.layoutConfigService.getConfig('colors.state.success')).alpha(0.8).rgbString(),
							data: []
						}, {
							label: 'Devam Ediyor',
							fill: false,
							borderWidth: 2,
							borderColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0.8).rgbString(),
							data: []
						}
					],
					total: 0
				};
				this.activityWidget2Data = JSON.parse(JSON.stringify(this.activityWidget1Data));
				this.activityWidget3Data = JSON.parse(JSON.stringify(this.activityWidget1Data));
				this.activityWidget4Data = JSON.parse(JSON.stringify(this.activityWidget1Data));
				for (let i = 1; i <= this.date.getDate(); i++) {
					const tempDate = new Date();
					tempDate.setDate(i);

					let a = res.body['Task']['Gör_Dur_Yeni'] ? res.body['Task']['Gör_Dur_Yeni'][tempDate.toISOString().substr(0, 10)] : 0;
					a = a ? a : 0;
					this.activityWidget1Data.datasets[0].data.push(a);
					let b = res.body['Task']['Gör_Dur_Yeni'] ? res.body['Task']['Gör_Dur_Yeni'][tempDate.toISOString().substr(0, 10)] : 0;
					b = b ? b : 0;
					this.activityWidget1Data.datasets[1].data.push(b);
					this.activityWidget1Data.labels.push(tempDate.toLocaleDateString());
					this.activityWidget1Data.total += a + b;

					a = res.body['Task']['Gör_Dur_Devam_Ediyor'] ? res.body['Task']['Gör_Dur_Devam_Ediyor'][tempDate.toISOString().substr(0, 10)] : 0;
					a = a ? a : 0;
					this.activityWidget2Data.datasets[0].data.push(a);
					b = res.body['Task']['Gör_Dur_Yapılamadı'] ? res.body['Task']['Gör_Dur_Yapılamadı'][tempDate.toISOString().substr(0, 10)] : 0;
					b = b ? b : 0;
					this.activityWidget2Data.datasets[1].data.push(b);
					this.activityWidget2Data.labels.push(tempDate.toLocaleDateString());
					this.activityWidget2Data.total += a + b;

					a = res.body['Task']['Gör_Dur_Tamamlandı'] ? res.body['Task']['Gör_Dur_Tamamlandı'][tempDate.toISOString().substr(0, 10)] : 0;
					a = a ? a : 0;
					this.activityWidget3Data.datasets[0].data.push(a);
					b = res.body['Task']['Gör_Dur_Tamamlandı'] ? res.body['Task']['Gör_Dur_Tamamlandı'][tempDate.toISOString().substr(0, 10)] : 0;
					b = b ? b : 0;
					this.activityWidget3Data.datasets[1].data.push(b);
					this.activityWidget3Data.labels.push(tempDate.toLocaleDateString());
					this.activityWidget3Data.total += a + b;
				}

				for (let i = 0; i <= this.date.getMonth(); i++) {
					const tempDate = new Date();
					tempDate.setDate(1);
					tempDate.setMonth(i);
					let a = res.body['Task'][tempDate.toISOString().substr(0, 10)];
					a = a ? a : 0;
					this.activityWidget4Data.datasets[0].data.push(a);
					this.activityWidget4Data.labels.push(Utils.getMonth(tempDate.getMonth()).title + ' ' + tempDate.getFullYear());
					this.activityWidget4Data.total = a;
				}
				this.activityWidget4Data.datasets[0].label = 'Aktif Talepler';

				/*this.salesData = { totalDiesel: 0, totalGas: 0, total: 0, monthlyDiesel: 0, monthlyGas: 0, monthlyTotal: 0, datasets: [], labels: [], maxData: 1 };
				this.salesWidget.initChart(Utils.makeSalesData(res.body['SummaryOpetSale'], this.salesData, '#5dccb5', '#2844b1', this.chartYear));*/

				this.cdr.markForCheck();
			}),
		).subscribe();
	}

	// Hikmet: Taleplerin türüne göre kaçar adet olduğu
	getTaskStatus() {
		const filters = new Set();
		filters.add({
			name: 'assigner.id',
			operator: 'EQUALS',
			value: this.baseService.getUser().id
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'dueTime', sortOrder: 'ASC' }],
			0,
			100
		);
		this.baseService.find(queryParams, 'tasks').subscribe(res => {
			this.taskyeni = 0;
			this.taskdevam = 0;
			this.taskred = 0;
			this.tasktamam = 0;
			for (const tsk of res.body) {
				if (tsk.taskType === null) {
					continue;
				}
				if (this.baseService.getAttrVal(tsk.status.id).label === 'Yeni') {
					this.taskyeni++;
				}
				if (this.baseService.getAttrVal(tsk.status.id).label === 'Devam Ediyor') {
					this.taskdevam++;
				}
				if (this.baseService.getAttrVal(tsk.status.id).label === 'Reddedildi') {
					this.taskred++;
				}
				if (this.baseService.getAttrVal(tsk.status.id).label === 'Tamamlandı') {
					this.tasktamam++;
				}
			}
		});
	}

	approve(row, flag) {
		this.baseService.update(undefined, 'quotes/update-approval-status?quoteId=' + row.id + '&isApproved=' + flag.toString()).subscribe(() => {
			Utils.showActionNotification('Onay durumu güncellendi', 'success', 10000, true, false, 3000, this.snackBar);
			this.cdr.markForCheck();
			this.router.navigate(['/']);
		});
	}

	/*quoteRowClicked(row) {
		this.router.navigate(['/quote'], { queryParams: { id: row.id, sourceObject: 'dashboard', sourceId: row.id } });
	}*/
}
