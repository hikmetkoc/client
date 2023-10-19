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

@Component({
	selector: 'kt-motionsums',
	templateUrl: './motionsums.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
	styleUrls: ['./motionsums.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class MotionSumsComponent extends BaseComponent implements OnInit, AfterViewInit {

	@ViewChild('calendar', undefined) calendarComponent: FullCalendarComponent;
	public visitword: string;
	isCalendar = false;
	calendarPlugins = [dayGridPlugin, interactionPlugin];
	calendarApi;
	users;
	utils = Utils;
	defaultFilter = [];
	defaultValues = [];

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

		this.model = Utils.getModel('MotionSums');
	}

	ngOnInit() {
		this.mainGrid.defaultSort = [{ sortOrder: 'DESC', sortBy: 'createdDate' }];
		this.init();
	}

	ngAfterViewInit() {
		this.afterViewInit();

		this.evaluateButtons();

		/*this.route.queryParams.subscribe(params => {
			setTimeout(function () {
				const date = new Date();
				const y = date.getFullYear();
				const m = date.getMonth();
				if (params.filter === 'pendingApproval') {
					this.mainGrid.activeFilter = {
						values: '[{"FieldName":"approvalStatusId","Operation":"EqualTo","Value": ' +
							this.baseService.getAttrByVal('Activity.ApprovalStatus', 'Onay Bekliyor').id +
							',"Title":"Onay Durumu","ValueTitle":"Onay Bekliyor"}]'
					};
					this.mainGrid.filterChange();
				} else if (params.filter === 'monthlyEvents') {
					this.mainGrid.activeFilter = {
						values: '[{"FieldName":"typeId","Operation":"EqualTo","Value": ' +
							this.baseService.getAttrByVal('Activity.Type', 'Etkinlik').id +
							',"Title":"Tipi","ValueTitle":"Etkinlik"}, {"FieldName":"dueTime","Operation":"GreaterThanOrEqualTo","Value": "' +
							Utils.dateFormatForApi(new Date(y, m, 1)).toString() +
							'","Title":"Planlanan Başlangıç Zamanı"}, {"FieldName":"dueTime","Operation":"LessThan","Value": "' +
							Utils.dateFormatForApi(new Date(y, m + 1, 1)).toString() +
							'","Title":"Planlanan Başlangıç Zamanı"}]'
					};
					this.mainGrid.filterChange();
				} else if (params.filter === 'monthlyTasks') {
					this.mainGrid.activeFilter = {
						values: '[{"FieldName":"typeId","Operation":"EqualTo","Value": ' +
							this.baseService.getAttrByVal('Activity.Type', 'Görev').id +
							',"Title":"Tipi","ValueTitle":"Görev"}, {"FieldName":"dueTime","Operation":"GreaterThanOrEqualTo","Value": "' +
							Utils.dateFormatForApi(new Date(y, m, 1)).toString() +
							'","Title":"Planlanan Başlangıç Zamanı"}, {"FieldName":"dueTime","Operation":"LessThan","Value": "' +
							Utils.dateFormatForApi(new Date(y, m + 1, 1)).toString() +
							'","Title":"Planlanan Başlangıç Zamanı"}]'
					};
					this.mainGrid.filterChange();
				}
			}.bind(this), 0);
		});*/
	}

	rowClicked(row, reload?) {
		if (reload) {
			this.reloadCurrent(row.id);
		} else {
			this.defaultFilter = [{
				name: 'motionsums.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultValues = [{
				field: 'motionsumsId',
				value: row.id
			}, {
				field: 'motionsums',
				value: row
			}];
			this.current = row;
		}
	}

	evaluateButtons() {
		this.buttons = [];

		this.buttons.push({
			display: this.baseService.getPermissionRule('user', 'update'),
			title: 'Maliyet Yerleri Raporu',
			icon: 'cloud_download',
			click: this.getReport.bind(this)
		});
	}

	calendarView(isCalendar) {
		this.isCalendar = isCalendar;

		this.evaluateButtons();

		if (this.isCalendar) {
			this.getEvents();
		}
	}

	clickButton(e) {
		this.getEvents(e.data._d);
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

	getEvents(date = new Date()) {
		const model = new QueryParamsModel();

		const filters = new Set();
		filters.add({
			name: 'dueTime',
			operator: FilterOperation.GREATER_OR_EQUAL_THAN,
			value: new Date(date.getFullYear(), date.getMonth() - 1, 1)
		});
		filters.add({
			name: 'dueTime',
			operator: FilterOperation.LESS_THAN,
			value: new Date(date.getFullYear(), date.getMonth() + 2, 1)
		});
		model.filter = Utils.makeFilter(filters);

		model.size = 50;
		model.sorts = [{ sortBy: 'createdDate', sortOrder: 'DESC' }];
		model.owner = 'HIERARCHY_D';
		model.assigner = 'HIERARCHY_D';
		this.baseService.find(model, this.model.apiName).pipe(
			tap(res => {
				this.calendarApi = this.calendarComponent.getApi();
				this.calendarApi.removeAllEvents();
				for (const row of res.body) {
					this.calendarApi.addEvent({
						id: JSON.stringify(row),
						title: (row.customer ? row.customer.name : '') + ' | ' + row.type.label + ' | ' + row.status.label ,
						start: row.dueTime,
						end: row.dueTime,
						allDay: false,
						row,
						backgroundColor: '#c3b0ff'
					});
				}
			}),
		).subscribe();
	}

	listChange() {
		if (this.isCalendar) {
			this.getEvents();
		}
		if (this.current) {
			this.reloadCurrent();
		}
	}

	behaviorRowClicked(row) {
		this.router.navigate(['/behavior'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
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
		const dialogRef = this.dialog.open(ReportDialogComponent, { data: { filter: 'date', title: 'Aktiviteler Raporu' } });
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
							Utils.downloadFile(res2, 'Excel', 'Aktiviteler Raporu');
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
}