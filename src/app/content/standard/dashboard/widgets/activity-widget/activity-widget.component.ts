// Angular
import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
// Layout
import { LayoutConfigService } from '../../../../../core/_base/layout';
// Charts
import { Chart } from 'chart.js/dist/Chart.min.js';
import {QueryParamsModel} from "../../../../_base/models/query-params.model";
import {Utils} from "../../../../_base/utils";
import {BaseService} from "../../../../_base/base.service";

export interface Timeline2Data {
	text: string;
	icon?: string;
	attachment?: string;
}

@Component({
	selector: 'kt-activity-widget',
	templateUrl: './activity-widget.component.html',
	styleUrls: ['./activity-widget.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ActivityWidgetComponent implements OnInit {
	// Public properties
	@Input() title: string;
	@Input() desc: string;
	@Input() data: { labels: string[]; datasets: any[]; };
	@ViewChild('chart', {static: true}) chart: ElementRef;


	/**
	 * Component constructor
	 *
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(
		private layoutConfigService: LayoutConfigService,
	) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		if (!this.data) {
			const color = Chart.helpers.color;
			this.data = {
				labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10', 'Label 11', 'Label 12', 'Label 13', 'Label 14', 'Label 15', 'Label 16', 'Label 9', 'Label 10', 'Label 11', 'Label 12', 'Label 13', 'Label 14', 'Label 15', 'Label 16'],
				datasets: [
					{
						label: 'Yeni',
						fill: false,
						borderWidth: 2,
						borderColor: color(this.layoutConfigService.getConfig('colors.state.success')).alpha(0.8).rgbString(),
						data: [
							15, 20, 25, 30, 25, 20, 15, 20, 25, 30, 25, 20, 15, 10, 15, 20, 20, 25, 30, 25, 20, 15, 20, 25
						]
					}, {
						label: 'Mevcut',
						fill: false,
						borderWidth: 2,
						borderColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0.8).rgbString(),
						data: [
							15, 20, 25, 30, 25, 20, 15, 20, 25, 30, 25, 20, 15, 10, 15, 20, 20, 25, 30, 25, 20, 15, 20, 25
						]
					}
				]
			};
		}

		this.initChartJS();
	}
	/** Init chart */
	initChartJS() {
		// For more information about the chartjs, visit this link
		// https://www.chartjs.org/docs/latest/getting-started/usage.html

		const chart = new Chart(this.chart.nativeElement, {
			type: 'line',
			data: this.data,
			options: {
				title: {
					display: false,
				},
				tooltips: {
					intersect: false,
					mode: 'x',
					xPadding: 10,
					yPadding: 10,
					caretPadding: 10
				},
				legend: {
					display: false
				},
				responsive: true,
				maintainAspectRatio: false,
				barRadius: 4,
				scales: {
					xAxes: [{
						display: false,
						gridLines: false,
						stacked: true
					}],
					yAxes: [{
						display: false,
						stacked: true,
						gridLines: false
					}]
				},
				layout: {
					padding: {
						left: 0,
						right: 0,
						top: 0,
						bottom: 0
					}
				}
			}
		});
	}
}
