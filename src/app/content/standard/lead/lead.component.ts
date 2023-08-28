import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DeleteEntityDialogComponent } from '../../_base/dialogs/delete-entity-dialog/delete-entity-dialog.component';

@Component({
	selector: 'kt-lead',
	templateUrl: './lead.component.html',
	styleUrls: ['./lead.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class LeadComponent extends BaseComponent implements OnInit, AfterViewInit {

	defaultFilter = [];
	defaultValues = [];
	utils = Utils;

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

		this.model = Utils.getModel('Lead');
	}

	ngOnInit() {
		this.init();
	}

	ngAfterViewInit() {
		this.afterViewInit();

		this.evaluateButtons();
	}

	rowClicked(row, reload?) {
		if (reload) {
			this.reloadCurrent(row.id);
		} else {
			this.defaultFilter = [{
				FieldName: 'lead.id',
				Operation: 'EqualTo',
				Value: row.id
			}];
			this.defaultValues = [{
				field: 'leadId',
				value: row.id
			}, {
				field: 'lead',
				value: row
			}];
			this.current = row;
		}
	}

	evaluateButtons() {
		this.buttons = [];

		this.buttons.push({
			display: this.baseService.getPermissionRule(this.model.name, 'update'),
			title: 'Yeni Müşteri Adayı',
			icon: 'add_box',
			click: this.mainGrid.add.bind(this.mainGrid)
		});
	}

	convertToCustomer() {
		this.router.navigate(['/activity/wizard'], { queryParams: { lead: JSON.stringify(this.current) } });
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
}
