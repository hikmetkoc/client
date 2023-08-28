// Angular
import { Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
// Layout config
import { LayoutConfigService } from '../../../../../core/_base/layout';

/**
 * Sample components with sample data
 */
@Component({
	selector: 'kt-sales-widget',
	templateUrl: './sales-widget.component.html',
	styleUrls: ['./sales-widget.component.scss']
})
export class SalesWidgetComponent implements OnInit {

	// Public properties
	@Input() data: { totalDiesel: 0, totalGas: 0, total: 0, monthlyDiesel: 0, monthlyGas: 0, monthlyTotal: 0, datasets: [], labels: [], maxData: 1000 };
	@Input() type = 'line';
	@ViewChild('chart', { static: true }) chart: ElementRef;
	currentChart;

	/**
	 * Component constructor
	 * @param layoutConfigService
	 */
	constructor(
		private layoutConfigService: LayoutConfigService,
		private cdr: ChangeDetectorRef,
	) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
	}

	public initChart(salesData) {
		if (this.currentChart) {
			this.currentChart.destroy();
		}
		this.currentChart = new Chart(this.chart.nativeElement, {
			type: this.type,
			data: salesData,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				legend: false,
				scales: {
					xAxes: [{
						categoryPercentage: 0.35,
						barPercentage: 0.70,
						display: true,
						scaleLabel: {
							display: false,
							labelString: 'Month'
						},
						gridLines: false,
						ticks: {
							display: true,
							beginAtZero: true,
							fontColor: this.layoutConfigService.getConfig('colors.base.shape.3'),
							fontSize: 13,
							padding: 10
						}
					}],
					yAxes: [{
						categoryPercentage: 0.35,
						barPercentage: 0.70,
						display: true,
						scaleLabel: {
							display: false,
							labelString: 'Value'
						},
						gridLines: {
							color: this.layoutConfigService.getConfig('colors.base.shape.2'),
							drawBorder: false,
							offsetGridLines: false,
							drawTicks: false,
							borderDash: [3, 4],
							zeroLineWidth: 1,
							zeroLineColor: this.layoutConfigService.getConfig('colors.base.shape.2'),
							zeroLineBorderDash: [3, 4]
						},
						ticks: {
							max: salesData.maxData,
							stepSize: salesData.maxData / 4,
							display: true,
							beginAtZero: true,
							fontColor: this.layoutConfigService.getConfig('colors.base.shape.3'),
							fontSize: 13,
							padding: 10
						}
					}]
				},
				title: {
					display: false
				},
				hover: {
					mode: 'index'
				},
				tooltips: {
					enabled: true,
					intersect: false,
					mode: 'x',
					bodySpacing: 5,
					yPadding: 10,
					xPadding: 10,
					caretPadding: 0,
					displayColors: false,
					backgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
					titleFontColor: '#ffffff',
					cornerRadius: 4,
					footerSpacing: 0,
					titleSpacing: 0
				},
				layout: {
					padding: {
						left: 0,
						right: 0,
						top: 5,
						bottom: 5
					}
				}
			}
		});
	}
}
