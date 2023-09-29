import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, ViewEncapsulation } from '@angular/core';
import { LayoutConfigService } from '../../../core/_base/layout';
import { BaseService } from '../../_base/base.service';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { Utils } from '../../_base/utils';
import { FilterOperation } from '../../_base/models/filter';
import { formatDate } from '@angular/common';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
	@ViewChild('salesWidget', undefined) salesWidget;
	announcements = [];
	tasks = [];
	usersContact = [];
	usersBirth = [];
	targets = [];

	ilktirnak;
	ikincitirnak;
	ucuncutirnak;

	taskyeni;
	taskdevam;
	taskred;
	tasktamam;

	activityWidget1Data;
	activityWidget2Data;
	activityWidget3Data;
	activityWidget4Data;
	date = new Date();
	/*salesData = { totalDiesel: 0, totalGas: 0, total: 0, monthlyDiesel: 0, monthlyGas: 0, monthlyTotal: 0, datasets: [], labels: [], maxData: 1000 };*/
	pendingQuotes = [];
	chartYear = 2022;
	utils = Utils;

	constructor(
		private cdr: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService,
		public baseService: BaseService,
		public snackBar: MatSnackBar,
		public router: Router,
	) {
	}

	ngOnInit(): void {
		this.getCharts();

		this.getAnnouncements();

		this.getTasks();

		this.getTaskStatus();

		this.getCont();

		this.getRequestWebPush();

		//this.getBirth();

		//this.getTargets();

	}

	getRequestWebPush() {
		if ('Notification' in window && Notification.permission === 'granted') {
			// Kullanıcı izni zaten alındı, bildirim gönder
			this.sendNotification('Başlık', 'Bildirim metni');
		} else if ('Notification' in window) {
			// Kullanıcı izni alınmamış, izin iste
			Notification.requestPermission().then(permission => {
				if (permission === 'granted') {
					// Kullanıcı izni verildi, bildirim gönder
					this.sendNotification('Başlık', 'Bildirim metni');
				}
			});
		}
	}

	sendNotification(title: string, message: string) {
		if (Notification.permission === 'granted') {
			const notification = new Notification(title, {
				body: message
			});
		}
	}

	getAnnouncements() {
		const filters = new Set();
		filters.add({
			name: 'active',
			operator: FilterOperation.EQUALS,
			value: true
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
			0,
			5
		);
		this.baseService.find(queryParams, 'announcements').subscribe(res => {
			this.announcements = [];
			for (const ann of res.body) {
				this.announcements.push({
					icon: ann.type ?
						(this.baseService.getAttrVal(ann.type.id).label === 'Başarı' ? 'flaticon2-checkmark kt-font-success' :
							(this.baseService.getAttrVal(ann.type.id).label === 'Uyarı' ? 'flaticon2-information kt-font-warning' : 'flaticon2-information kt-font-danger')) : 'flaticon2-checkmark kt-font-success',
					title: ann.title,
					id: ann.id,
					value: ann.createdDate,
					valueColor: ann.type ?
						(this.baseService.getAttrVal(ann.type.id).label === 'Başarı' ? 'kt-font-success' :
							(this.baseService.getAttrVal(ann.type.id).label === 'Uyarı' ? 'kt-font-warning' : 'kt-font-danger')) : 'kt-font-success',
					desc: ann.description
				});
			}
			this.cdr.markForCheck();
		});
	}

	getTasks() {
		const filters = new Set();
		filters.add({
			name: 'dueTime',
			operator: FilterOperation.GREATER_OR_EQUAL_THAN,
			value: new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate())
		});
		filters.add({
			name: 'dueTime',
			operator: FilterOperation.LESS_THAN,
			value: new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 1)
		});
		filters.add({
			name: 'owner.id',
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
			this.tasks = [];
			for (const tsk of res.body) {
				if (tsk.taskType === null) { continue; }
				this.tasks.push({
					time: formatDate(tsk.dueTime, 'HH:mm', 'tr-TR'),
					icon: 'fa fa-genderless' + (tsk.status && this.baseService.getAttrVal(tsk.status.id).label === 'Reddedildi' ? ' kt-font-danger' : (tsk.status && this.baseService.getAttrVal(tsk.status.id).label === 'Tamamlandı' ? ' ' : ' kt-font-success')),
					text: tsk.assigner.firstName + ' ' + tsk.assigner.lastName + ' - ' + tsk.type.label  + ' - ' + tsk.status.label +  ' - ' + tsk.importance.label + ' - ' + (tsk.description ? tsk.description : ''),
					id: tsk.id
				});
			}
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

	getTargets() {
		const filters = new Set();
		filters.add({
			name: 'termStart',
			operator: FilterOperation.GREATER_OR_EQUAL_THAN,
			value: new Date(this.date.getFullYear(), this.date.getMonth(), 1)
		});
		filters.add({
			name: 'termStart',
			operator: FilterOperation.LESS_THAN,
			value: new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1)
		});
		filters.add({
			name: 'owner.id',
			operator: 'EQUALS',
			value: this.baseService.getUser().id
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'termStart', sortOrder: 'ASC' }],
			0,
			100
		);
		this.baseService.find(queryParams, 'targets').subscribe(res => {
			this.targets = [];
			for (const target of res.body) {
				this.targets.push({
					title: 'Hedef',
					value: target.amount,
					valueClass: '',
					type: 'currency'
				});
				this.targets.push({
					title: 'Satış',
					value: target.realizedAmount,
					valueClass: '',
					type: 'currency'
				});
				const percent = target.amount ? (target.realizedAmount) / target.amount : 0;
				this.targets.push({
					title: 'Gerçekleşme',
					value: percent,
					valueClass: percent < 0.70 ? 'kt-font-danger' : percent < 1 ? 'kt-font-warning' : 'kt-font-success',
					type: 'percent'
				});
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
