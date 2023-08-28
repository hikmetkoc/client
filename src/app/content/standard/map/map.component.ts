import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
	selector: 'kt-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
	encapsulation: ViewEncapsulation.None
})
export class MapComponent extends BaseComponent implements OnInit, AfterViewInit {

	map: any;
	timer;

	constructor(
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver,
		public modalService: NgbModal
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('Customer');
	}

	ngOnInit() {
		this.init();
	}

	ngAfterViewInit() {
		this.afterViewInit();
		this.launchMap();
	}

	launchMap() {
		if (navigator.geolocation) {
			const options = { timeout: 60000 };
			navigator.geolocation.getCurrentPosition
				(this.fillMap.bind(this), this.errorHandler.bind(this), options);
		} else {
			Utils.showActionNotification('Konum Erişiminiz Kontrol Ediniz', 'warning', 10000, true, true, 3000, this.snackBar);
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
				let green = '';
				if (value.owner && value.owner.id === this.baseService.getUser().id) {
					green = '-green';
				}
				L.marker([value.latitude, value.longitude], {
					icon: L.icon({
						iconSize: [25, 41],
						iconAnchor: [13, 41],
						iconUrl: 'assets/marker-icon' + green + '.png',
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
}
