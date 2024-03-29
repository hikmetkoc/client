import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { Filter, FilterOperation } from '../../_base/models/filter';
import {catchError, tap} from 'rxjs/operators';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DeleteEntityDialogComponent } from '../../_base/dialogs/delete-entity-dialog/delete-entity-dialog.component';
import {ReportDialogComponent} from "../../_base/dialogs/report-dialog/report-dialog.component";
import {HttpUtilsService} from "../../_base/http-utils.service";
import {HttpClient} from "@angular/common/http";
import {formatDate} from "@angular/common";
import {GotoApprovalConfirmComponent} from "../../_base/dialogs/gotoapproval-confirm/gotoapproval-confirm.component";

@Component({
	selector: 'kt-task',
	templateUrl: './task.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
	styleUrls: ['./task.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class TaskComponent extends BaseComponent implements OnInit, AfterViewInit {

	@ViewChild('calendar', undefined) calendarComponent: FullCalendarComponent;
	public visitword: string;
	isCalendar = false;
	calendarPlugins = [dayGridPlugin, interactionPlugin];
	calendarApi;
	users;
	defaultFilter = [];
	defaultValues = [];
	utils = Utils;

	constructor(
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver,
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('Task');
	}

	ngOnInit() {
		this.mainGrid.defaultSort = [{ sortOrder: 'DESC', sortBy: 'createdDate' }];
		this.init();
	}

	ngAfterViewInit() {
		this.afterViewInit();
		this.evaluateButtons();
	}

	rowClicked(row, reload?) {
		if (reload) {
			this.reloadCurrent(row.id);
		} else {
			this.defaultFilter = [{
				name: 'task.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultValues = [{
				field: 'taskId',
				value: row.id
			}, {
				field: 'task',
				value: row
			}];
			this.current = row;
		}
	}

	evaluateButtons() {
		this.buttons = [];

		this.buttons.push({
			display: !this.isCalendar,
			title: 'Ajanda Görünümü',
			icon: 'web',
			click: this.calendarView.bind(this, true)
		}, {
			display: this.isCalendar,
			title: 'Liste Görünümü',
			icon: 'list',
			click: this.calendarView.bind(this, false)
		}, {
			display: this.baseService.getPermissionRule('user', 'update'),
			title: 'Talepler Raporu',
			icon: 'cloud_download',
			click: this.getReport.bind(this)
		}, {
			display: this.baseService.getPermissionRule(this.model.name, 'update'),
			title: 'Yeni Talep',
			icon: 'add_box',
			click: this.mainGrid.add.bind(this.mainGrid)
		});
		if (this.baseService.getUserId() === 80 || this.baseService.getUserId() === 90) {
			this.buttons.push({
				display: true,
				title: 'İş Planı Raporu',
				icon: 'file_download',
				click: this.getBTReport.bind(this)
			});
		}
	}

	calendarView(isCalendar) {
		this.isCalendar = isCalendar;

		this.evaluateButtons();

		if (this.isCalendar) {
			// this.getEvents();
		}
	}
	remember() {	// Mail Bildirimi için Hatırlatma Fonksiyonu
		const apiUrl = 'api/tasks/sendnotificationmail';
		const receiver = this.current.owner.eposta;
		// const receiver = 'hikmet@meteorpetrol.com';
		const subject = 'Talep Hatırlatması';
		const message = this.current.assigner.firstName + ' ' + this.current.assigner.lastName + ','
			+ this.current.taskType.label + ' konulu, ' + this.current.description + ' açıklamalı talep hakkında işlem yapmanız için hatırlatmada bulunuyor.';
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

	eventClick(e) {
		this.mainGrid.edit(JSON.parse(e.event.id));
	}

	dateClick(arg) {
		this.mainGrid.add([{ field: 'dueTime', value: arg.date.toISOString() }]);
	}

	clearEvents() {
		this.calendarApi.removeAllEvents();
	}

	listChange() {
		if (this.isCalendar) {
		}
		if (this.current) {
			this.reloadCurrent();
		}
	}

	activityRowClicked(row) {
		this.router.navigate(['/activity'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
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
				this.resetCurrent();
			});
		});
	}

	deleteElement() {
		return this.dialog.open(DeleteEntityDialogComponent, {
			data: {},
			width: '440px'
		});
	}
	getReport() {
		const dialogRef = this.dialog.open(ReportDialogComponent, { data: { filter: 'date', title: 'Talepler Raporu' } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				if (this.baseService.loadingSubject.value) { return; }
				this.baseService.loadingSubject.next(true);
				res.startDate = Utils.dateFormatForApi(res.startDate);
				res.endDate = Utils.dateFormatForApi(res.endDate);
				const httpHeaders = this.httpUtils.getHTTPHeaders();
				this.http.post('api/' + this.model.apiName + '/report?startDate=' + res.startDate + '&endDate=' + res.endDate, undefined, { headers: httpHeaders, responseType: 'blob' })
					.pipe(
						tap(res2 => {
							Utils.downloadFile(res2, 'Excel', 'Talepler Raporu');
							this.baseService.loadingSubject.next(false);
						}),
						catchError(err => {
							this.baseService.loadingSubject.next(false);
							return err;
						})
					).subscribe();
			}
		});
	}
	getBTReport() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post('api/' + this.model.apiName + '/reportBT', undefined, { headers: httpHeaders, responseType: 'blob' })
			.pipe(
				tap(res2 => {
					Utils.downloadFile(res2, 'Excel', 'İş Planı Raporu');
					this.baseService.loadingSubject.next(false);
				}),
				catchError(err => {
					this.baseService.loadingSubject.next(false);
					return err;
				})
			).subscribe();
	}
}
