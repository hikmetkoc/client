import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewEncapsulation, ViewChild, ViewChildren } from '@angular/core';
import { MatSnackBar, MatDialog, DateAdapter } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { SimpleTableComponent } from '../../_base/simpletable/simpletable.component';
import { HttpUtilsService } from '../../_base/http-utils.service';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { DeleteEntityDialogComponent } from '../../_base/dialogs/delete-entity-dialog/delete-entity-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportDialogComponent } from '../../_base/dialogs/report-dialog/report-dialog.component';

@Component({
	selector: 'kt-report',
	templateUrl: './report.component.html',
	styleUrls: ['./report.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class ReportComponent extends BaseComponent implements OnInit, AfterViewInit {

	@ViewChildren('popover', undefined) popovers;
	@ViewChild('reportsModal', undefined) reportsModal;
	defaultFilter = [];
	defaultValues = [];
	columns = [];
	filters = [];
	mode: 'column' | 'filter' = 'column';
	subject;
	currentColumn;
	currentFilter;
	utils;
	data;

	constructor(
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver,
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		public modalService: NgbModal,
		private dateAdapter: DateAdapter<Date>
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('Report');

		this.utils = Utils;

		this.dateAdapter.setLocale('tr');
		this.dateAdapter.getFirstDayOfWeek = () => 1;
	}

	ngOnInit() {
		this.init();
	}

	ngAfterViewInit() {
		this.afterViewInit();

		this.evaluateButtons();
	}

	evaluateButtons() {
		this.buttons = [];
		this.buttons.push({
			display: this.baseService.getPermissionRule('user', 'update'),
			title: 'Hazır Raporlar',
			icon: 'cloud_download',
			click: this.showReportsModal.bind(this)
		}, {
			display: this.baseService.getPermissionRule(this.model.name, 'update'),
			title: 'Yeni ' + this.model.title,
			icon: 'add_box',
			click: this.mainGrid.add.bind(this.mainGrid)
		}
		);
	}

	rowClicked(row, reload?) {
		if (reload) {
			this.reloadCurrent(row.id);
		} else {
			this.defaultFilter = [{
				FieldName: 'contract.id',
				Operation: 'EqualTo',
				Value: row.id
			}];
			this.defaultValues = [{
				field: 'contractId',
				value: row.id
			}, {
				field: 'contract',
				value: row
			}];
			this.current = row;
		}
		this.loadSavedReport();
	}

	nodeClick(node) {
		this.closePopovers();
		const newNode = JSON.parse(JSON.stringify(node));
		if (this.mode === 'column') {
			Utils.arrayAddIfNotPresent(this.columns, newNode);
		} else {
			setTimeout(() => {
				this.currentFilter = newNode;
				this.popovers.last.open();
			}, 0);
			Utils.arrayAddIfNotPresent(this.filters, newNode);
		}
	}

	columnSelected(column, popover) {
		column.operator = Utils.getDefaultOperator(column.fieldType);
		this.currentColumn = column;
		this.closePopovers();
		popover.open();
	}

	filterSelected(filter, popover) {
		filter.operator = Utils.getDefaultOperator(filter.fieldType);
		this.currentFilter = filter;
		this.closePopovers();
		popover.open();
	}

	closePopovers() {
		for (const popover of this.popovers.toArray()) {
			popover.close();
		}
	}

	columnRemoved(column) {
		this.columns = Utils.arrayRemoveIfPresent(this.columns, column);
	}

	filterRemoved(filter) {
		this.filters = Utils.arrayRemoveIfPresent(this.filters, filter);
	}

	tabChange(tab) {
		if (tab.nextId === 'columnsTab') {
			this.mode = 'column';
		} else {
			this.mode = 'filter';
		}
	}

	subjectChange(subject) {
		this.resetReport();
		this.subject = subject;
	}

	resetReport() {
		this.subject = undefined;
		this.columns = [];
		this.filters = [];
		this.data = undefined;
	}

	run() {
		const queryParams = new QueryParamsModel();
		queryParams.size = 100;
		queryParams.columns = Array.from(this.columns);
		queryParams.filter = Utils.makeFilter(this.filters);
		queryParams.sorts = undefined;
		this.baseService.find(queryParams, this.subject.apiName).subscribe((res) => {
			this.data = res.body.slice(0, 100);
		});
	}

	export() {
		const queryParams = new QueryParamsModel();
		queryParams.size = 100;
		queryParams.columns = this.columns;
		queryParams.fileType = 'Excel';
		queryParams.filter = Utils.makeFilter(this.filters);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post('api/' + this.subject.apiName, queryParams, { headers: httpHeaders, responseType: 'blob' })
			.pipe(
				tap(res => {
					Utils.downloadFile(res, 'Excel', this.model.name);
				}),
				catchError(err => {
					return err;
				})
			).subscribe();
	}

	save() {
		this.current.queryJson = JSON.stringify({
			columns: this.columns,
			filters: this.filters,
			subjectName: this.subject ? this.subject.name : undefined
		});
		this.baseService.update(this.current, this.model.apiName).subscribe(() => {
			Utils.showActionNotification('Rapor kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
		});
	}

	loadSavedReport() {
		this.resetReport();
		if (this.current.queryJson) {
			const queryObject = JSON.parse(this.current.queryJson);
			if (queryObject.subjectName) {
				this.subject = Utils.getModel(queryObject.subjectName);
				this.columns = queryObject.columns;
				this.filters = queryObject.filters;
			}
		}
	}

	delete(_item: any, e) {
		if (e) { e.stopPropagation(); }

		const dialogRef = this.dialog.open(DeleteEntityDialogComponent, {
			data: {},
			width: '440px'
		});
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

	showReportsModal() {
		this.modalService.open(this.reportsModal, { size: 'sm' });
	}

	getReportDialog(title, url, filter = 'date') {
		const dialogRef = this.dialog.open(ReportDialogComponent, { data: { filter, title } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				if (this.baseService.loadingSubject.value) { return; }
				this.baseService.loadingSubject.next(true);
				res.startDate = Utils.dateFormatForApi(res.startDate);
				res.endDate = Utils.dateFormatForApi(res.endDate);
				const httpHeaders = this.httpUtils.getHTTPHeaders();
				this.http.post('api/' + url + 'year=' + res.year + '&startDate=' + res.startDate + '&endDate=' + res.endDate, undefined, { headers: httpHeaders, responseType: 'blob' })
					.pipe(
						tap(res2 => {
							Utils.downloadFile(res2, 'Excel', title);
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
