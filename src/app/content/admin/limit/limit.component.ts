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

@Component({
	selector: 'kt-limit',
	templateUrl: './limit.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
	styleUrls: ['./limit.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class LimitComponent extends BaseComponent implements OnInit, AfterViewInit {

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

		this.model = Utils.getModel('BuyLimit');
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
				name: 'buylimit.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultValues = [{
				field: 'buylimitId',
				value: row.id
			}, {
				field: 'limit',
				value: row
			}];
			this.current = row;
		}
	}

	evaluateButtons() {
		this.buttons = [];

		this.buttons.push({
			display: this.baseService.getPermissionRule(this.model.name, 'update'),
			title: 'Yeni Satın Alma Talebi',
			icon: 'add_box',
			click: this.mainGrid.add.bind(this.mainGrid)
		});
	}

	eventClick(e) {
		this.mainGrid.edit(JSON.parse(e.event.id));
	}

	dateClick(arg) {
		this.mainGrid.add([{ field: 'dueTime', value: arg.date.toISOString() }]);
	}

	listChange() {
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

}
