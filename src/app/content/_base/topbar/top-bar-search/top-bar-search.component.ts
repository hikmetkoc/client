// Angular
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { BaseService } from '../../base.service';
import { HttpClient } from '@angular/common/http';
import { HttpUtilsService } from '../../http-utils.service';
import { Utils } from '../../utils';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'kt-top-bar-search',
	templateUrl: './top-bar-search.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarSearchComponent implements OnInit {
	// Public properties

	// Set icon class name
	@Input() icon = 'flaticon2-search-1';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	@ViewChild('searchInput', undefined) searchInput: ElementRef;
	@ViewChild('dropdown', undefined) dropdown: NgbDropdown;

	data: any[];
	result: any[];
	loading: boolean;
	timer: any;

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	constructor(
		private cdr: ChangeDetectorRef,
		private baseService: BaseService,
		public http: HttpClient,
		public httpUtils: HttpUtilsService
	) { }

	/**
	 * On init
	 */
	ngOnInit(): void {
		// simulate result from API
		// type 0|1 as separator or item
		this.result = [];
	}

	/**
	 * Search
	 * @param e: Event
	 */
	search(e) {
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = setTimeout(function () {
			this.data = null;
			if (e.target.value.length > 2) {
				this.loading = true;
				this.cdr.markForCheck();
				this.http.post('/api/dashboards/search?search=' + e.target.value, {}, {
					headers: this.httpUtils.getHTTPHeaders()
				})
					.subscribe(value => {
						this.result = [];
						if (value['customerList'].length > 0) {
							this.result.push({
								icon: '',
								text: Utils.getModel('Customer').pluralTitle,
								type: 0
							});
						}
						value['customerList'].map(x => this.result.push({
							id: x.id,
							route: Utils.getModel('Customer').name,
							icon: '<i class="flaticon-suitcase kt-font-primary"></i>',
							text: x.name,
							type: 1
						}));
						if (value['paymentOrderList'].length > 0) {
							this.result.push({
								icon: '',
								text: Utils.getModel('PaymentOrder').pluralTitle,
								type: 0
							});
						}
						value['paymentOrderList'].map(x => this.result.push({
							id: x.id,
							route: Utils.getModel('PaymentOrder').name,
							icon: '<i class="flaticon-coins kt-font-primary"></i>',
							text: x.name,
							type: 1
						}));
						if (value['taskList'].length > 0) {
							this.result.push({
								icon: '',
								text: Utils.getModel('Task').pluralTitle,
								type: 0
							});
						}
						value['taskList'].map(x => this.result.push({
							id: x.id,
							route: Utils.getModel('Task').name,
							icon: '<i class="flaticon-edit kt-font-primary"></i>',
							text: x.name,
							type: 1
						}));
						if (value['contactList'].length > 0) {
							this.result.push({
								icon: '',
								text: Utils.getModel('Contact').pluralTitle,
								type: 0
							});
						}
						value['contactList'].map(x => this.result.push({
							id: x.id,
							route: Utils.getModel('Contact').name,
							icon: '<i class="flaticon-users kt-font-primary"></i>',
							text: x.firstName + ' ' + x.lastName,
							type: 1
						}));
						if (value['campaignList'].length > 0) {
							this.result.push({
								icon: '',
								text: Utils.getModel('Campaign').pluralTitle,
								type: 0
							});
						}
						value['campaignList'].map(x => this.result.push({
							id: x.id,
							route: Utils.getModel('Campaign').name,
							icon: '<i class="flaticon-pie-chart kt-font-primary"></i>',
							text: x.name,
							type: 1
						}));
						this.data = this.result;
						this.loading = false;
						this.dropdown.open();
						this.cdr.markForCheck();
					});
			}
		}.bind(this), 500);
	}

	/**
	 * Clear search
	 *
	 * @param e: Event
	 */
	clear(e) {
		this.data = null;
		this.searchInput.nativeElement.value = '';
	}
}
