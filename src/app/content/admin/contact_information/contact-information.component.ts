import {Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import {QueryParamsModel} from '../../_base/models/query-params.model';


@Component({
	selector: 'kt-contact-information',
	templateUrl: './contact-information.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactInformationComponent extends BaseComponent implements OnInit, AfterViewInit {
	usersContact = [];
	defaultFilter = [];
	defaultValues = [];

	constructor(
		public baseService: BaseService,
		private cdr: ChangeDetectorRef,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver,
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('Contact_Information');
	}

	ngOnInit() {
		this.init();
		this.getCont();
	}

	ngAfterViewInit() {
		this.afterViewInit();
	}

	getCont() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'siralama', sortOrder: 'ASC' }],
			0,
			300
		);
		this.baseService.find(queryParams, 'users').subscribe(res => {
			this.usersContact = [];
			for (const usr of res.body) {
				if (usr.siralama === '000' || usr.siralama === null || usr.activated === false ) { continue; }
				this.usersContact.push({
					icon: 'kt-font-success',
					sirket: usr.sirket.label,
					birim: usr.birim.label,
					unvan: usr.unvan.label,
					name: usr.firstName + ' ' + usr.lastName,
					phone: usr.phone,
					short_code: usr.short_code,
					email: usr.email,
					id: usr.id
				});
			}
			this.cdr.markForCheck();
		});
	}
}
