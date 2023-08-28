import {Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewEncapsulation, ViewChild} from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import {DeleteEntityDialogComponent} from "../../_base/dialogs/delete-entity-dialog/delete-entity-dialog.component";
import {QueryParamsModel} from "../../_base/models/query-params.model";
import {FilterOperation} from "../../_base/models/filter";
import {catchError, tap} from "rxjs/operators";
import {ReportDialogComponent} from "../../_base/dialogs/report-dialog/report-dialog.component";
import {FullCalendarComponent} from "@fullcalendar/angular";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {HttpClient} from "@angular/common/http";
import {HttpUtilsService} from "../../_base/http-utils.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";


@Component({
	selector: 'kt-exuseholiday',
	templateUrl: './exuseholiday.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
	styleUrls: ['./exuseholiday.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ExuseHolidayComponent extends BaseComponent implements OnInit, AfterViewInit {

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

		this.model = Utils.getModel('ExuseHoliday');
	}

	ngOnInit() {
		this.mainGrid.defaultSort = [{sortOrder: 'DESC', sortBy: 'createdDate'}];
		this.init();

		const queryParams = new QueryParamsModel(
			undefined,
			[{sortBy: 'fullName', sortOrder: 'ASC'}],
			0,
			100
		);
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
				name: 'exuseholiday.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultValues = [{
				field: 'exuseholidayId',
				value: row.id
			}, {
				field: 'exuseholiday',
				value: row
			}];
			this.current = row;
		}
	}

	evaluateButtons() {
		this.buttons = [];
		this.buttons.push({
			display: this.baseService.getPermissionRule('user', 'update'),
			title: 'İzinler Raporu',
			icon: 'cloud_download',
			click: this.getReport.bind(this)
		}, {
			display: this.baseService.getPermissionRule(this.model.name, 'update'),
			title: 'Yeni Mazeret İzni Talebi',
			icon: 'add_box',
			click: this.mainGrid.add.bind(this.mainGrid)
		});
	}

	clickButton(e) {
		this.getEvents(e.data._d);
	}

	eventClick(e) {
		this.mainGrid.edit(JSON.parse(e.event.id));
	}

	dateClick(arg) {
		this.mainGrid.add([{field: 'checkInTime', value: arg.date.toISOString()}]);
	}

	getEvents(date = new Date()) {
	}

	listChange() {
		if (this.current) {
			this.reloadCurrent();
		}
	}

	delete(_item: any, e) {
		if (e) {
			e.stopPropagation();
		}

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
		const dialogRef = this.dialog.open(ReportDialogComponent, { data: { filter: 'date', title: 'İzinler Raporu' } });
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
							Utils.downloadFile(res2, 'Excel', 'İzinler Raporu');
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
	/*quoteRowClicked(row) {
		this.router.navigate(['/quote'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}*/

	/*getReport() {
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
	}*/
}

