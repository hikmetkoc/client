import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { Filter, FilterOperation } from '../../_base/models/filter';
import { tap, catchError } from 'rxjs/operators';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DeleteEntityDialogComponent } from '../../_base/dialogs/delete-entity-dialog/delete-entity-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportDialogComponent } from '../../_base/dialogs/report-dialog/report-dialog.component';
import { HttpClient } from '@angular/common/http';
import { HttpUtilsService } from '../../_base/http-utils.service';

@Component({
	selector: 'kt-behavior',
	templateUrl: './behavior.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
	styleUrls: ['./behavior.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class BehaviorComponent extends BaseComponent implements OnInit, AfterViewInit {

	@ViewChild('calendar', undefined) calendarComponent: FullCalendarComponent;
	@ViewChild('reportModal', undefined) reportModal;
	defaultFilter = [];
	defaultValues = [];
	public visitword: string;
	isCalendar = false;
	calendarPlugins = [dayGridPlugin, interactionPlugin];
	calendarApi;
	users;
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
		public modalService: NgbModal,
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('Behavior');
	}

	ngOnInit() {
		this.mainGrid.defaultSort = [{ sortOrder: 'DESC', sortBy: 'createdDate' }];
		this.init();

		const queryParams = new QueryParamsModel(
			undefined,
			[{ sortBy: 'fullName', sortOrder: 'ASC' }],
			0,
			100
		);
		// TODO:
		// this.baseService.find(queryParams, 'users/hierarchical-users?id=' + this.baseService.getUser().id).subscribe(res => {
		// 	this.users = res.body;
		// 	for (const user of this.users) {
		// 		user.values = '[{"FieldName":"owner.id","Operation":"EqualTo","Value":' + user.id + ',"Title":"Sahip","ValueTitle":"' + user.fullName + '"}]';
		// 		user.id = undefined;
		// 	}
		// });
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
				name: 'behavior.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultValues = [{
				field: 'behaviorId',
				value: row.id
			}, {
				field: 'behavior',
				value: row
			}];
			this.current = row;
		}
	}

	evaluateButtons() {
		this.buttons = [];

		this.buttons.push(/*{
			display: !this.isCalendar,
			title: 'Ajanda Görünümü',
			icon: 'web',
			click: this.calendarView.bind(this, true)
		}, */{
			display: this.isCalendar,
			title: 'Liste Görünümü',
			icon: 'list',
			click: this.calendarView.bind(this, false)
		}, {
			display: this.baseService.getPermissionRule('user', 'update'),
			title: 'İşlemler Raporu',
			icon: 'cloud_download',
			click: this.getReport.bind(this)
		}/*, {
			display: this.baseService.getPermissionRule(this.model.name, 'update'),
			title: 'Yeni İşlem',
			icon: 'add_box',
			click: this.mainGrid.add.bind(this.mainGrid)
		}*/);
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
		this.mainGrid.add([{ field: 'checkInTime', value: arg.date.toISOString() }]);
	}

	clearEvents() {
		this.calendarApi.removeAllEvents();
	}

	getEvents(date = new Date()) {
		const model = new QueryParamsModel();

		const filters = new Set();
		filters.add({
			name: 'checkInTime',
			operator: FilterOperation.GREATER_OR_EQUAL_THAN,
			value: new Date(date.getFullYear(), date.getMonth() - 1, 1)
		});
		filters.add({
			name: 'checkInTime',
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
						title: row.subject,
						start: row.checkInTime,
						end: row.checkOutTime,
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

	/*quoteRowClicked(row) {
		this.router.navigate(['/quote'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}*/

	getReport() {
		const dialogRef = this.dialog.open(ReportDialogComponent, { data: { filter: 'date', title: 'Aktivite Raporu' } });
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
