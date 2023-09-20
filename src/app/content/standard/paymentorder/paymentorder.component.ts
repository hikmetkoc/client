import {
	Component,
	OnInit,
	ChangeDetectionStrategy,
	ViewChild,
	AfterViewInit,
	ViewEncapsulation,
	ChangeDetectorRef
} from '@angular/core';
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
import {
	IkReportManagerDialogComponent
} from "../../_base/detail/reportmanager/ikreport-manager-dialog/ikreport-manager-dialog.component";
import {
	BuyReportManagerDialogComponent
} from "../../_base/detail/reportmanager/buyreport-manager-dialog/buyreport-manager-dialog.component";

@Component({
	selector: 'kt-paymentorder',
	templateUrl: './paymentorder.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
	styleUrls: ['./paymentorder.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PaymentOrderComponent extends BaseComponent implements OnInit, AfterViewInit {

	@ViewChild('calendar', undefined) calendarComponent: FullCalendarComponent;
	public visitword: string;
	isCalendar = false;
	calendarPlugins = [dayGridPlugin, interactionPlugin];
	calendarApi;
	users;
	utils = Utils;
	defaultFilter = [];
	productUser = [];
	defaultValues = [];

	constructor(
		private cdr: ChangeDetectorRef,
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

		this.model = Utils.getModel('PaymentOrder');
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
				name: 'paymentorder.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultValues = [{
				field: 'paymentorderId',
				value: row.id
			}, {
			}, {
				field: 'paymentorder',
				value: row
			}];
			this.current = row;
		}
	}

	evaluateButtons() {
		this.buttons = [];

		this.buttons.push({
			display: this.baseService.getPermissionRule('user', 'update') && (this.baseService.getUser().birim.id !== 'Birimler_Muh'),
			title: 'Ödeme Talimatı Raporu',
			icon: 'cloud_download',
			click: this.getReport.bind(this)
		},
			{
				display: this.baseService.getPermissionRule(this.model.name, 'update'),
				title: 'Yeni Ödeme Talimatı',
				icon: 'add_box',
				click: this.mainGrid.add.bind(this.mainGrid)
			}, {
				display: this.baseService.getPermissionRule(this.model.name, 'update'),
				title: 'Seçili Ödeme Talimatı Raporu',
				icon: 'insert_drive_file',
				click: this.mainGrid.selectedRowExcelReport.bind(this.mainGrid)
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

	spendRowClicked(row) {
		this.router.navigate(['/spend'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
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
		const dialogRef = this.dialog.open(ReportDialogComponent, { data: { filter: 'date', title: 'Ödeme Talimatı Raporu' } });
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
							Utils.downloadFile(res2, 'Excel', 'Ödeme Talimatı Raporu');
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

	showFiles() {
		const dialogRef = this.dialog.open(BuyReportManagerDialogComponent, {
			width: '1200px',
			data: { current: this.current, model: this.model }
		});
		dialogRef.afterClosed().subscribe(() => {
		});
	}

}
