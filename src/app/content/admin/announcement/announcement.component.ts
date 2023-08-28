import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import {ConnectStoreDialogComponent} from "../../_base/dialogs/connect-store-dialog/connect-store-dialog.component";
import {SendSmsDialogComponent} from "../../_base/dialogs/send-sms-dialog/send-sms-dialog.component";


@Component({
	selector: 'kt-announcement',
	templateUrl: './announcement.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnouncementComponent extends BaseComponent implements OnInit, AfterViewInit {

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

		this.model = Utils.getModel('Announcement');
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
			display: this.baseService.getPermissionRule(this.model.name, 'update'),
			title: 'Yeni Duyuru',
			icon: 'add_box',
			click: this.mainGrid.add.bind(this.mainGrid)
		},
			{
				display: this.baseService.getPermissionRule(this.model.name, 'update'),
				title: 'Yeni SMS',
				icon: 'send',
				click: this.sendSms.bind(this)
			});
	}

	sendSms() {
		const dialogRef = this.dialog.open(SendSmsDialogComponent, {data: {current: this.current, model: this.model}});
		dialogRef.afterClosed().subscribe(res => {
			Utils.showActionNotification('Gönderildi', 'success', 10000, true, false, 3000, this.snackBar);
		});
	}
}
