import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreakpointObserver } from '@angular/cdk/layout';
import { LayoutConfigService } from '../../../core/_base/layout';
import { tap } from 'rxjs/operators';
import { FilterOperation } from '../../_base/models/filter';

@Component({
	selector: 'kt-team',
	templateUrl: './team.component.html',
	styleUrls: ['./team.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class TeamComponent extends BaseComponent implements OnInit, AfterViewInit {

	@ViewChild('mainGrid', undefined) mainGrid;
	@ViewChild('porttlet', undefined) porttlet;
	@ViewChild('salesWidget', undefined) salesWidget;
	@ViewChild('targetGraphWidget', undefined) targetGraphWidget;
	url;
	defaultActivityFilter = [];
	defaultTaskFilter = [];
	defaultQuoteFilter = [];
	defaultContractFilter = [];
	defaultCustomerFilter = [];
	defaultValues = [];
	activityWidget1Data;
	activityWidget2Data;
	activityWidget3Data;
	activityWidget4Data;
	date = new Date();
	salesData = { totalDiesel: 0, totalGas: 0, total: 0, monthlyDiesel: 0, monthlyGas: 0, monthlyTotal: 0, datasets: [], labels: [], maxData: 1000 };
	targets = [];
	chartYear = 2020;

	constructor(
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public modalService: NgbModal,
		public breakpointObserver: BreakpointObserver,
		private layoutConfigService: LayoutConfigService,
		private cdr: ChangeDetectorRef,
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('User');
	}

	ngOnInit() {
		this.url = 'users/hierarchical-users-only-downwards?id=' + this.baseService.getUser().id;

		this.init();
	}

	ngAfterViewInit() {
		this.afterViewInit();

		this.evaluateButtons();
	}

	evaluateButtons() {
		this.buttons = [];
	}

	rowClicked(row, reload?) {
		if (reload) {
			this.reloadCurrent(row.id);
		} else {
			this.defaultActivityFilter = [{
				name: 'owner.id',
				operator: 'EQUALS',
				value: row.id
			}];
			/*this.defaultTaskFilter = [{
				name: 'assigner.id',
				operator: 'EQUALS',
				value: row.id
			}];*/
			this.defaultQuoteFilter = [{
				name: 'customer.owner.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultContractFilter = [{
				name: 'customer.owner.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultCustomerFilter = [{
				name: 'owner.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultValues = [{
				field: 'ownerId',
				value: row.id
			}, {
				field: 'owner',
				value: row
			}];
			this.current = row;
			this.getCharts();
			this.getTargets();
		}
	}

	getCharts(kill = false) {
		const data = [];

		this.baseService.find(undefined, 'dashboards?userId=' + this.current.id + '&year=' + this.chartYear).pipe(
			tap(res => {
				const color = Chart.helpers.color;
				this.activityWidget1Data = {
					labels: [],
					datasets: [
						{
							label: 'Yeni Müşteri',
							fill: false,
							borderWidth: 2,
							borderColor: color(this.layoutConfigService.getConfig('colors.state.success')).alpha(0.8).rgbString(),
							data: []
						}, {
							label: 'Mevcut Müşteri',
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

					let a = res.body['Activity']['Müş_Dur_Yeni'] ? res.body['Activity']['Müş_Dur_Yeni'][tempDate.toISOString().substr(0, 10)] : 0;
					a = a ? a : 0;
					this.activityWidget1Data.datasets[0].data.push(a);
					let b = res.body['Activity']['Müş_Dur_MevcutAktif'] ? res.body['Activity']['Müş_Dur_MevcutAktif'][tempDate.toISOString().substr(0, 10)] : 0;
					b = b ? b : 0;
					this.activityWidget1Data.datasets[1].data.push(b);
					this.activityWidget1Data.labels.push(a + ' Yeni ' + b + ' Mevcut');
					this.activityWidget1Data.total += a + b;

					a = res.body['Quote']['Müş_Dur_Yeni'] ? res.body['Quote']['Müş_Dur_Yeni'][tempDate.toISOString().substr(0, 10)] : 0;
					a = a ? a : 0;
					this.activityWidget2Data.datasets[0].data.push(a);
					b = res.body['Quote']['Müş_Dur_MevcutAktif'] ? res.body['Quote']['Müş_Dur_MevcutAktif'][tempDate.toISOString().substr(0, 10)] : 0;
					b = b ? b : 0;
					this.activityWidget2Data.datasets[1].data.push(b);
					this.activityWidget2Data.labels.push(a + ' Yeni ' + b + ' Mevcut');
					this.activityWidget2Data.total += a + b;

					a = res.body['Contract']['Müş_Dur_Yeni'] ? res.body['Contract']['Müş_Dur_Yeni'][tempDate.toISOString().substr(0, 10)] : 0;
					a = a ? a : 0;
					this.activityWidget3Data.datasets[0].data.push(a);
					b = res.body['Contract']['Müş_Dur_MevcutAktif'] ? res.body['Contract']['Müş_Dur_MevcutAktif'][tempDate.toISOString().substr(0, 10)] : 0;
					b = b ? b : 0;
					this.activityWidget3Data.datasets[1].data.push(b);
					this.activityWidget3Data.labels.push(a + ' Yeni ' + b + ' Mevcut');
					this.activityWidget3Data.total += a + b;
				}

				for (let i = 0; i <= this.date.getMonth(); i++) {
					const tempDate = new Date();
					tempDate.setDate(1);
					tempDate.setMonth(i);
					let a = res.body['Customer'][tempDate.toISOString().substr(0, 10)];
					a = a ? a : 0;
					this.activityWidget4Data.datasets[0].data.push(a);
					this.activityWidget4Data.labels.push(Utils.getMonth(tempDate.getMonth()).title + ' ' + tempDate.getFullYear());
					this.activityWidget4Data.total = a;
				}
				this.activityWidget4Data.datasets[0].label = 'Aktif Müşteriler';

				this.salesData = { totalDiesel: 0, totalGas: 0, total: 0, monthlyDiesel: 0, monthlyGas: 0, monthlyTotal: 0, datasets: [], labels: [], maxData: 1 };
				this.salesWidget.initChart(Utils.makeSalesData(res.body['SummaryOpetSale'], this.salesData, '#5dccb5', '#2844b1', this.chartYear));

				this.cdr.markForCheck();
			}),
		).subscribe();
	}

	getTargets() {
		const filters = new Set();
		filters.add({
			name: 'termStart',
			operator: FilterOperation.GREATER_OR_EQUAL_THAN,
			value: new Date(this.date.getFullYear(), 0, 1)
		});
		filters.add({
			name: 'termStart',
			operator: FilterOperation.LESS_THAN,
			value: new Date(this.date.getFullYear() + 1, 0, 1)
		});
		filters.add({
			name: 'owner.id',
			operator: 'EQUALS',
			value: this.current.id
		});
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'termStart', sortOrder: 'ASC' }],
			0,
			100
		);
		this.baseService.find(queryParams, 'targets').subscribe(res => {
			this.targets = [];
			let lastTarget;
			for (const target of res.body) {
				lastTarget = target;
			}

			this.targets.push({
				title: 'Hedef',
				value: lastTarget.amount,
				valueClass: '',
				type: 'currency'
			});
			this.targets.push({
				title: 'Satış',
				value: lastTarget.realizedAmount,
				valueClass: '',
				type: 'currency'
			});
			const percent = lastTarget.amount ? (lastTarget.realizedAmount) / lastTarget.amount : 0;
			this.targets.push({
				title: 'Gerçekleşme',
				value: percent,
				valueClass: percent < 0.70 ? 'kt-font-danger' : percent < 1 ? 'kt-font-warning' : 'kt-font-success',
				type: 'percent'
			});

			this.targetGraphWidget.initChart(Utils.makeTargetData(res.body, '#fd397a', '#5dccb5'));

			this.cdr.markForCheck();
		});
	}
}
