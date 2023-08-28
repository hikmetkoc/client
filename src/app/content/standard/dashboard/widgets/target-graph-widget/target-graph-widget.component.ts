// Angular
import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
// Layout
import { LayoutConfigService } from '../../../../../core/_base/layout';
// Charts
import { Chart } from 'chart.js/dist/Chart.min.js';

@Component({
	selector: 'kt-target-graph-widget',
	templateUrl: './target-graph-widget.component.html',
	styleUrls: ['./target-graph-widget.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class TargetGraphWidgetComponent implements OnInit {
	@ViewChild('chart', { static: true }) chart: ElementRef;

	constructor(private layoutConfigService: LayoutConfigService) {
	}

	ngOnInit() {
	}

	initChart(targetData) {
		const chart = new Chart(this.chart.nativeElement, {
			type: 'line',
			data: targetData,
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
							max: targetData.maxData,
							stepSize: targetData.maxData / 4,
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
					titleSpacing: 0,
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
