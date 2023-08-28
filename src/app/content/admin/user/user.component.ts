import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Filter, FilterOperation } from '../../_base/models/filter';
import { TreeviewItem, TreeviewI18n } from 'ngx-treeview';
import { DefaultTreeviewI18n } from './i18n';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
	selector: 'kt-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
	providers: [{ provide: TreeviewI18n, useClass: DefaultTreeviewI18n }],
	encapsulation: ViewEncapsulation.None
})
export class UserAdmComponent extends BaseComponent implements OnInit, AfterViewInit {

	@ViewChild('hierarchyModal', undefined) hierarchyModal;
	rolesList = [];
	groupsList = [];
	userRoles = [];
	userGroups = [];
	hierarchyArray = [];
	hierarchyTreeConfig = {
		hasAllCheckBox: false,
		hasFilter: true,
		hasCollapseExpand: true,
		decoupleChildFromParent: true,
		maxHeight: 600
	};
	hierarchyTreeItems: TreeviewItem[] = [];
	printStyle = {
		h1: { color: 'red' },
		h2: { border: 'solid 1px' },
		'.treeviewItem': {
			'margin-left': '1cm'
		},
		'*': {
			color: 'red'
		}
	};
	children = [];

	constructor(
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public modalService: NgbModal,
		public breakpointObserver: BreakpointObserver,
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('User');
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
			title: 'Hiyerarşi',
			icon: 'supervisor_account',
			click: this.showHierarchy.bind(this, this.hierarchyModal)
		}, {
			display: this.baseService.getPermissionRule(this.model.name, 'update'),
			title: 'Yeni Kullanıcı',
			icon: 'add_box',
			click: this.mainGrid.add.bind(this.mainGrid)
		});
	}

	rowClicked(row) {
		this.current = row;
	}

	getRolesList() {
		const queryParams = new QueryParamsModel();
		queryParams.size = 1000;
		queryParams.sorts = [];
		this.baseService.find(queryParams, 'roles').subscribe((res) => {
			this.rolesList = res.body;
			this.getUserRoles();
		});
	}

	getUserRoles() {
		const queryParams = new QueryParamsModel();
		queryParams.size = 1000;
		queryParams.sorts = [];
		this.baseService.find(queryParams, 'users/users/roles').subscribe((res) => {
			this.userRoles = [];
			for (const role of this.rolesList) {
				for (const userRole of res.body) {
					if (role.id === userRole.id) { this.userRoles.push(role); }
				}
			}
		});
	}

	setUserRoles() {
		this.baseService.update(this.userRoles, 'User/SetUserRoles/' + this.current.id).subscribe(() => {
			Utils.showActionNotification('Başarı ile Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
		});
	}

	getGroupsList() {
		const queryParams = new QueryParamsModel([
			new Filter('typeId', undefined), // this.baseService.getAttrByVal('User.Type', 'Kullanıcı Grubu').id),
			// new Filter('id', this.current.id, FilterOperation.NotEqualTo) TODO: NOTEQUALS
		]);
		queryParams.size = 1000;
		this.baseService.find(queryParams, 'User').subscribe((res) => {
			this.groupsList = res.body;
			this.getUserGroups();
		});
	}

	getUserGroups() {
		const queryParams = new QueryParamsModel();
		queryParams.size = 1000;
		this.baseService.find(queryParams, 'User/GetMemberOf/' + this.current.id).subscribe((res) => {
			this.userGroups = [];
			for (const group of this.groupsList) {
				for (const userGroup of res.body) {
					if (group.id === userGroup.id) { this.userGroups.push(group); }
				}
			}
		});
	}

	setUserGroups() {
		this.baseService.update(this.userGroups, 'User/SetMemberOf/' + this.current.id).subscribe(() => {
			Utils.showActionNotification('Başarı ile Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
		});
	}

	showHierarchy(content) {
		const queryParams = new QueryParamsModel();
		this.baseService.find(queryParams, 'User/HierarchicalTree/0').subscribe(res => {
			this.hierarchyArray = [];
			this.makeHierarchyArray(res.body, 0);
			this.hierarchyTreeItems = [];
			for (const user of res.body) {
				const item = new TreeviewItem({
					text: user.fullName, value: user.id, collapsed: true, children: this.makeChildren(user.childUsers)
				});
				this.hierarchyTreeItems.push(item);
			}
		});
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	makeChildren(users) {
		const items = [];
		for (const user of users) {
			items.push({ text: user.fullName, value: user.id, collapsed: true, children: this.makeChildren(user.childUsers) });
		}
		return items;
	}

	makeHierarchyArray(users, level) {
		for (const user of users) {
			user.level = level;
			user.levelString = '';
			for (let i = 0; i < level; i++) {
				user.levelString += '| . . . . . ';
			}
			this.hierarchyArray.push(user);
			if (user.childUsers.length > 0) {
				this.makeHierarchyArray(user.childUsers, level + 1);
			}
		}
	}

	printHierarchy() {
		const printContent = document.getElementById('print-section');
		const windowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
		windowPrt.document.write('<style>.treeview-item {margin-left: 1cm;}.no-print, input {display: none !important;}</style>');
		windowPrt.document.write(printContent.innerHTML);
		windowPrt.document.close();
		windowPrt.focus();
		windowPrt.print();
		windowPrt.close();
	}

	// getChildren() {
	// 	this.baseService.find(undefined, 'User/HierarchicalChildren/' + this.current.id).subscribe((res) => {
	// 		this.children = res.body;
	// 	});
	// }
}
