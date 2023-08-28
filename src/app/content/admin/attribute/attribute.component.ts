import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { LineItemsComponent } from '../../_base/lineitems/lineitems.component';
import { BreakpointObserver } from '@angular/cdk/layout';


@Component({
	selector: 'kt-attribute',
	templateUrl: './attribute.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributeComponent extends BaseComponent implements OnInit, AfterViewInit {

	@ViewChild(LineItemsComponent, undefined) lineItems;
	detailButtons = [];

	constructor(
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver,
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('Attribute');
	}

	ngOnInit() {
		this.init();
	}

	ngAfterViewInit() {
		this.afterViewInit();
		this.mainGrid.dataSource.entitySubject.subscribe(res => {
			for (const row of res) {
				row.originalRow = JSON.parse(JSON.stringify(row));
			}
		});

		this.evaluateButtons();
	}

	save() {
		this.current.originalRow.attributeValues = Utils.makeRows(this.lineItems.dataSource.entitySubject.value, Utils.getModel('AttributeValue'));

		this.baseService.update(this.current.originalRow, this.model.apiName).subscribe(() => {
			Utils.showActionNotification('Başarı ile Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);

			this.baseService.refreshLoginInfo();
		});

		this.resetCurrent();
	}

	evaluateButtons() {
		this.detailButtons.push({
			display: this.baseService.getPermissionRule(this.model.name, 'update'),
			title: 'Kaydet',
			icon: 'save',
			click: this.save.bind(this)
		});
	}
}
