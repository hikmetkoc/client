import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { Filter } from '../../_base/models/filter';
import { BreakpointObserver } from '@angular/cdk/layout';


@Component({
	selector: 'kt-role',
	templateUrl: './role.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class RoleComponent extends BaseComponent implements OnInit, AfterViewInit {

	models: any;
	operationsList = [];
	roleOperations = [];
	rolePermissions: any;

	constructor(
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('Role');
		this.models = JSON.parse(JSON.stringify(Utils.getModels()));
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
			title: 'Yeni Rol',
			icon: 'add_box',
			click: this.mainGrid.add.bind(this.mainGrid)
		});
	}

	rowClicked(row) {
		this.current = row;
	}

	getOperationsList() {
		const queryParams = new QueryParamsModel();
		queryParams.size = 1000;
		this.baseService.find(queryParams, 'OperationRule').subscribe((res) => {
			this.operationsList = res.body;
			this.getRoleOperations();
		});
	}

	getRoleOperations() {
		const queryParams = new QueryParamsModel();
		queryParams.size = 1000;
		this.baseService.find(queryParams, 'Role/GetRoleOperationRules/' + this.current.id).subscribe((res) => {
			this.roleOperations = [];
			for (const operation of this.operationsList) {
				for (const roleOperation of res.body) {
					if (operation.id === roleOperation.id) { this.roleOperations.push(operation); }
				}
			}
		});
	}

	setRoleOperations() {
		this.baseService.update(this.roleOperations, 'Role/SetRoleOperationRules/' + this.current.id).subscribe(() => {
			Utils.showActionNotification('Başarı ile Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);

			this.baseService.refreshLoginInfo();
		});
	}

	getRolePermissions() {
		const params = new QueryParamsModel([new Filter('roleId', this.current.id)]);
		params.size = 1000;
		this.baseService.find(params, 'PermissionRule').subscribe((res) => {
			this.rolePermissions = [];
			for (const model of this.models) {
				const rolePermission: any = {};
				rolePermission.roleId = this.current.id;
				rolePermission.objectName = model.name;
				rolePermission.isHierarchical = true;
				rolePermission.delete = false;
				rolePermission.read = false;
				rolePermission.update = false;
				rolePermission.translate = model.title;
				if (model.crud) {
					for (const permission of res.body) {
						if (model.name === permission.objectName) {
							rolePermission.id = permission.id;
							rolePermission.delete = permission.delete;
							rolePermission.read = permission.read;
							rolePermission.update = permission.update;
							rolePermission.isHierarchical = permission.isHierarchical;
						}
					}
					this.rolePermissions.push(rolePermission);
				}
			}
		});
	}

	setRolePermissions() {
		this.baseService.update(this.rolePermissions, 'PermissionRule/SetRolePermissionRules/' + this.current.id).subscribe(() => {
			Utils.showActionNotification('Başarı ile Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);

			this.baseService.refreshLoginInfo();
		});
	}
}
