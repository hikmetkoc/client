import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { ActivatedRoute, Router } from '@angular/router';

import { Filter, FilterOperation } from '../../_base/models/filter';
import { HttpUtilsService } from '../../_base/http-utils.service';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DeleteEntityDialogComponent } from '../../_base/dialogs/delete-entity-dialog/delete-entity-dialog.component';
import { LayoutConfigService } from '../../../core/_base/layout';

@Component({
	selector: 'kt-customer',
	templateUrl: './customer.component.html',
	styleUrls: ['./customer.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
	encapsulation: ViewEncapsulation.None
})
export class CustomerComponent extends BaseComponent implements OnInit, AfterViewInit {

	@ViewChild('uploadBulkExcelInput', undefined) uploadBulkExcelInput;
	@ViewChild('mainGrid', undefined) mainGrid;
	//@ViewChild('salesWidget', undefined) salesWidget;
	defaultFilter = [];
	defaultValues = [];
	isMap = false;
	currentLongitude;
	currentLatitude;
	fields = [];
	modelRows = [];
	surveyQuestions = [];
	map: any;
	customerSurvey: any;
	utils = Utils;
	surveySaveIsDirty: any;
	campaigns = [];
	summary: any;
	contracts = [];
	timer;
	//salesData = { totalDiesel: 0, totalGas: 0, total: 0, datasets: [], labels: [], maxData: 1000 };
	addresses = [];
	chartYear = 2020;
	addressExtraButtons = [
		{
			description: 'Haritada Ara',
			icon: 'my_location',
			color: 'primary',
			name: 'showonmap',
			evaluate: this.addressButtonEvaluate.bind(this),
			click: this.addressButtonClick.bind(this)
		}
	];

	constructor(
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver,
		private http: HttpClient,
		public modalService: NgbModal,
		private httpUtils: HttpUtilsService,
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('Customer');
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
		this.buttons.push(
			// {
			// 	display: true,
			// 	title: 'Toplu Yükleme',
			// 	icon: 'arrow_upward',
			// 	subs: [
			// 		{
			// 			title: 'Excel Şablonu İndir',
			// 			click: this.downloadBulkExcel.bind(this)
			// 		},
			// 		{
			// 			title: 'Dosyayı Geri Yükle',
			// 			click: this.uploadBulkExcelClick.bind(this)
			// 		}
			// 	]
			// },
			{
				// 	display: true,
				// 	title: 'Harita',
				// 	icon: 'map',
				// 	click: this.launchMap.bind(this)
				// }, {
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
				name: 'customer.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultValues = [{
				field: 'customerId',
				value: row.id
			}, {
				field: 'customer',
				value: row
			}];
			this.current = row;
			// this.getCampaigns();
			//this.getSalesData();
		}
	}

	resetCurrent() {
		super.resetCurrent();
	}

	launchMap() {
		this.isMap = !this.isMap;

		if (this.isMap) {
			if (navigator.geolocation) {
				const options = { timeout: 60000 };
				navigator.geolocation.getCurrentPosition
				(this.fillMap.bind(this), this.errorHandler.bind(this), options);
			} else {
				Utils.showActionNotification('Konum Erişiminiz Kontrol Ediniz', 'warning', 10000, true, true, 3000, this.snackBar);
			}
		}
	}

	fillMap(position) {
		if (!this.map) {
			this.map = L.map('nearestCustomersMap', {
				minZoom: 2,
				maxZoom: 18
			}).setView([position.coords.latitude, position.coords.longitude], 12);
		}

		L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; ' + this,
			maxZoom: 18
		}).addTo(this.map);

		this.map.on('moveend', function () {
			if (this.timer) {
				clearTimeout(this.timer);
			}
			this.timer = setTimeout(function () {
				this.getNearestCustomers(this.map.getCenter(), this.map.getBounds());
			}.bind(this), 750);
		}.bind(this));

		this.getNearestCustomers(this.map.getCenter(), this.map.getBounds());
	}

	getNearestCustomers(position, bounds) {
		const params = {
			northEast: bounds._northEast,
			southWest: bounds._southWest,
			position
		};
		this.baseService.find(params, this.model.apiName + '/nearest-customers').subscribe(res => {
			for (const value of res.body) {
				L.marker([value.latitude, value.longitude], {
					icon: L.icon({
						iconSize: [25, 41],
						iconAnchor: [13, 41],
						iconUrl: 'assets/marker-icon.png',
						shadowUrl: 'assets/marker-shadow.png'
					}),
					title: '' + value.name + ''
				})
					.bindPopup('<b>' + value.name + '</b>' +
						'<br>Email: ' + value.email + '<br><div style="cursor: pointer;" onclick=" document.location.href= ' + '\'tel:' + value.phone +
						'\'">Telefon: ' + value.phone + '</div><br>' +
						'<a style="cursor: pointer;" href="https://www.google.com/maps/dir/' + position.lat + ',' + position.lng + '/' +
						value.latitude + ',' + value.longitude + '/@' + value.latitude + ',' + value.longitude + ',12.5z"  target="_blank">Rota Çiz</a>')
					.addTo(this.map);
			}
			this.map.invalidateSize();
		});
	}

	errorHandler(err) {
		if (err.code === 1) {
			// alert('Error: Access is denied!');
			Utils.showActionNotification('Konum Erişiminiz Kontrol Ediniz', 'warning', 10000, true, true, 3000, this.snackBar);
		} else if (err.code === 2) {
			// alert('Error: Position is unavailable!');
			Utils.showActionNotification('Konum Erişiminiz Kontrol Ediniz', 'warning', 10000, true, true, 3000, this.snackBar);
		}
	}

	/*showSurvey(content) {
		// this.surveySaveIsDirty = undefined;
		// this.customerSurvey = undefined;
		// this.surveyQuestions = undefined;
		this.baseService.find(undefined, 'customer-survey-answers/get-all?customerId=' + this.current.id).subscribe(res => {
			this.surveyQuestions = res.body;
			// if (res.body.customerSurvey === null) {
			// 	this.resetSurvey();
			// } else {
			// 	this.customerSurvey = res.body.customerSurvey;
			// 	this.surveyQuestions = res.body.surveyQuestions;
			// 	for (const q of this.surveyQuestions) {
			// 		if (q.answer) {
			// 			for (const a of q.surveyQuestionAnswers) {
			// 				if (q.answer.id === a.id) { q.answer = a; }
			// 			}
			// 		}
			// 	}
			// }
			for (const q of this.surveyQuestions) {
				if (q.customerSurveyAnswer) {
					for (const a of q.surveyAnswers) {
						if (q.customerSurveyAnswer.id === a.id) { q.customerSurveyAnswer = a; }
					}
				}
			}
		});
		this.modalService.open(content, {
			size: 'lg'
		});
	}*/

	/*saveSurvey() {
		// const customerSurvey = {
		// 	customerId: this.current.id,
		// 	surveyQuestions: this.surveyQuestions
		// };
		// for (const q of customerSurvey.surveyQuestions) {
		// 	if (!q.answer && q.isRequisite) {
		// 		this.surveySaveIsDirty = true;
		// 		return;
		// 	}
		// }
		this.baseService.update(this.surveyQuestions, 'customer-survey-answers/save-all?customerId=' + this.current.id).subscribe(() => {
			Utils.showActionNotification('Başarı ile Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
			this.modalService.dismissAll();
			this.reloadCurrent();
		});
	}*/

	// resetSurvey() {
	// 	const params = new QueryParamsModel([new Filter('typeId', this.baseService.getAttrByVal('Survey.Type', 'Müşteri Değerlendirme Anketi').id, FilterOperation.EQUALS)],
	// 		[{ sortBy: 'createdDate', sortOrder: 'DESC' }], 0, 1);
	// 	this.baseService.find(params, 'Survey').subscribe(res2 => {
	// 		if (res2.body.result.length === 1) {
	// 			// params = new QueryParamsModel([new Filter('surveyVersion.surveyId', res2.body.result[0].id, FilterOperation.EqualTo)], 'ASC', 'id', 0, 100);
	// 			this.baseService.find(res2.body.result[0].id, 'SurveyQuestion/GetSurveyQuestionListBySurveyId').subscribe(res3 => {
	// 				this.surveyQuestions = res3.body.result;
	// 				for (const question of this.surveyQuestions) {
	// 					question.answer = null;
	// 				}
	// 			});
	// 		} else {
	// 			Utils.showActionNotification('Anket bulunamadı', 'warning', 10000, true, false, 3000, this.snackBar);
	// 		}
	// 	});
	// }

	downloadBulkExcel() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post('api' + '/' + this.model.apiName + '/DownloadCustomerExcel', undefined, { headers: httpHeaders, responseType: 'blob' })
			.pipe(
				tap(res => {
					Utils.downloadFile(res, 'Excel', this.model.name);
				}),
				catchError(err => {
					return err;
				})
			).subscribe();
	}

	uploadBulkExcelClick() {
		let event = new MouseEvent('click', { bubbles: true });
		this.uploadBulkExcelInput.nativeElement.dispatchEvent(event);
	}

	uploadBulkExcel(e) {
		const uploadFile: any = {};
		const input = e.target;
		const reader = new FileReader();
		if (input.files.length === 0) { return; }
		reader.readAsDataURL(input.files[0]);
		reader.onloadend = function () {
			uploadFile.base64File = reader.result;
			this.baseService.update(uploadFile, this.model.apiName + '/ImportCustomerExcel').subscribe(() => {
				Utils.showActionNotification('Başarı ile Yüklendi', 'success', 10000, true, false, 3000, this.snackBar);
				this.loadList();
			});
		}.bind(this);
	}

	getCampaigns() {
		// this.baseService.find(undefined, 'Campaign/CampaignByCustomerId?customerId=' + this.current.id).subscribe(res => {
		// 	this.campaigns = res.body;
		// });
	}

	showSummary(content) {
		this.baseService.find(this.current.id, 'Customer/GetCustomerRatingByCustomerId').subscribe(res => {
			this.summary = res.body;
		});

		this.modalService.open(content, {
			size: 'lg'
		});
	}

	print360() {
		const printContent = document.getElementById('print-section');
		const windowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
		windowPrt.document.write('<style>table,th,td {border: 1px solid #BBB;}.close{display:none;}</style>');
		windowPrt.document.write(printContent.innerHTML);
		windowPrt.document.close();
		windowPrt.focus();
		windowPrt.print();
		windowPrt.close();
	}

	taskRowClicked(row) {
		this.router.navigate(['/customtask'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}

	offerRowClicked(row) {
		this.router.navigate(['/offer'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}

	/*quoteRowClicked(row) {
		this.router.navigate(['/quote'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}*/

	contactRowClicked(row) {
		this.router.navigate(['/contact'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}
	ibanRowClicked(row) {
		this.router.navigate(['/iban'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}

	addressRowClicked(row) {
		 //this.router.navigate(['/address'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}

	responsibleRowClicked(row) {
		this.router.navigate(['/responsible'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}
	buyRowClicked(row) {
		this.router.navigate(['/buy'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}

	invoiceListRowClicked(row) {
		this.router.navigate(['/invoicelist'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
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

	/*getSalesData() {
		this.salesData = { totalDiesel: 0, totalGas: 0, total: 0, datasets: [], labels: [], maxData: 1 };
		this.baseService.find(this.current.id, 'dashboards/customer-sales-report?customerId=' + this.current.id + '&year=' + this.chartYear).subscribe(res => {
			this.salesWidget.initChart(Utils.makeSalesData(res.body, this.salesData, '#5dccb5', '#2844b1', this.chartYear));
		});
	}*/

	addressButtonEvaluate(row: any, button: any) {
		return true;
	}

	addressButtonClick(e, row, button) {
		if (e) { e.stopPropagation(); }
		if (button.name === 'showonmap') {
			if (row.latitude && row.longitude) {
				window.open(
					'https://www.google.com/maps/search/?api=1&query=' + row.latitude + ',' + row.longitude,
					'_blank'
				);
			} else if (row.city && row.district) {
				window.open(
					'https://maps.google.com/?q=' + row.city.name + ' ' + row.district.name + ' ' + row.detail,
					'_blank'
				);
			} else {
				Utils.showActionNotification('Adres eksik', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		}
	}
}
