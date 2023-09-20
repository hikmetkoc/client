import {
	Component,
	OnInit,
	ChangeDetectionStrategy,
	AfterViewInit,
	ViewEncapsulation,
	ViewChild,
	ChangeDetectorRef
} from '@angular/core';
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
import {ReportDialogComponent} from "../../_base/dialogs/report-dialog/report-dialog.component";
import {catchError, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {HttpUtilsService} from "../../_base/http-utils.service";

@Component({
	selector: 'kt-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
	providers: [{ provide: TreeviewI18n, useClass: DefaultTreeviewI18n }],
	encapsulation: ViewEncapsulation.None
})
export class UserComponent extends BaseComponent implements OnInit, AfterViewInit {

	@ViewChild('hierarchyModal', undefined) hierarchyModal;
	utils;
	rolesList = [];
	groupsList = [];
	userRoles = [];
	userGroups = [];
	defaultFilter = [];
	defaultValues = [];
	hierarchyArray = [];
	usersHoliday = [];
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
	productUser = [];
	/*addressExtraButtons = [
		{
			description: 'Onayla',
			icon: 'check_circle_outline',
			color: 'primary',
			name: 'approve',
			evaluate: this.approveButtonEvaluate.bind(this),
			click: this.approveButtonClick.bind(this)
		},
		{
			description: 'Reddet',
			icon: 'highlight_off',
			color: 'warn',
			name: 'reject',
			evaluate: this.rejectButtonEvaluate.bind(this),
			click: this.rejectButtonClick.bind(this)
		}
	];*/

	constructor(
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		private cdr: ChangeDetectorRef,
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
		this.utils = Utils;
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

		this.buttons.push();
		if (this.baseService.getUserId() === 2000 || this.baseService.getUserId() === 2) {
			this.buttons.push({
				display: true,
				title: 'Yeni Kullanıcı',
				icon: 'add_box',
				click: this.mainGrid.add.bind(this.mainGrid)
			},
				{
					display: this.baseService.getPermissionRule('user', 'update'),
					title: 'Toplu İzinler Raporu',
					icon: 'star',
					click: this.getHolReport.bind(this)
				},
			{
				display: this.baseService.getPermissionRule('user', 'update'),
					title: 'Personeller Raporu',
				icon: 'cloud_download',
				click: this.getReport.bind(this)
			});
		} if (this.baseService.getUser().birim.id === 'Birimler_IT') {
			this.buttons.push({
					display: true,
					title: 'Yeni Personel',
					icon: 'person',
					click: this.mainGrid.newPerson.bind(this)
				});
		}
	}

	rowClicked(row, reload?) {
		if (reload) {
			this.reloadCurrent(row.id);
		} else {
			this.defaultFilter = [{
				name: 'user.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultValues = [{
				field: 'userId',
				value: row.id
			}, {
				field: 'user',
				value: row
			}];
			this.current = row;
		}
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

	ikfileRowClicked(row) {
		this.router.navigate(['/ikfile'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}

	holidayRowClicked(row) {
		this.router.navigate(['/holiday'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
	}
	exuseholidayRowClicked(row) {
		this.router.navigate(['/exuseholiday'], { queryParams: { id: row.id, sourceObject: this.model.name.toLowerCase(), sourceId: this.current['id'] } });
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
	approveButtonEvaluate(row: any, button: any) {
		return row;
	}

	/*approveButtonClick(e, row, button) {
		if (e) { e.stopPropagation(); }
		if (button.name === 'approve') {
			row.Status = true;
			row.approvalStatusId = 'Söz_Dur_Aktif';
			const filters = new Set();
			const queryParams = new QueryParamsModel(
					Utils.makeFilter(filters),
					[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
					0,
					100
			);
			this.baseService.find(queryParams, 'holidays').subscribe(res => {
				this.productUser = [];
				for (const usr of res.body) {
					if (usr.assigner.id !== this.baseService.getUserId()) {
						continue;
					}
					this.baseService.update({approvalStatusId: 'Söz_Dur_Aktif'}, '/holidays').subscribe(() => {
						this.resetCurrent();
					});
				}
				this.cdr.markForCheck();
			});
		}
	}*/

	rejectButtonEvaluate(row: any, button: any) {
		return row;
	}

	rejectButtonClick(e, row, button) {
		if (e) { e.stopPropagation(); }
		if (button.name === 'reject') {
			const filters = new Set();
			const queryParams = new QueryParamsModel(
				Utils.makeFilter(filters),
				[{ sortBy: 'createdDate', sortOrder: 'DESC' }],
				0,
				100
			);
			this.baseService.find(queryParams, 'holidays').subscribe(res => {
				this.productUser = [];
				for (const usr of res.body) {
					if (usr.assigner.id !== this.baseService.getUserId()) { continue; }
					this.baseService.update({...row, status: false }, '/holidays').subscribe(() => {
						usr.approvalStatus.id = 'Söz_Dur_Pasif';
						this.resetCurrent();
					});
				}
				this.cdr.markForCheck();
			});
		}
	}

	getReport() {
		const dialogRef = this.dialog.open(ReportDialogComponent, { data: { filter: 'date', title: 'Personeller Raporu' } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				if (this.baseService.loadingSubject.value) { return; }
				this.baseService.loadingSubject.next(true);
				res.startDate = Utils.dateFormatForApi(res.startDate);
				res.endDate = Utils.dateFormatForApi(res.endDate);
				const httpHeaders = this.httpUtils.getHTTPHeaders();
				this.http.post('api/' + this.model.apiName + '/report?startDate=' + res.startDate + '&endDate=' + res.endDate, undefined, { headers: httpHeaders, responseType: 'blob' })
					.pipe(
						tap(res2 => {
							Utils.downloadFile(res2, 'Excel', 'Personeller Raporu');
							this.baseService.loadingSubject.next(false);
						}),
						catchError(err => {
							this.baseService.loadingSubject.next(false);
							return err;
						})
					).subscribe();
			}
		});
	}

	getHolReport() {
		const dialogRef = this.dialog.open(ReportDialogComponent, { data: { filter: 'date', title: 'Toplu İzinler Raporu' } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				if (this.baseService.loadingSubject.value) { return; }
				this.baseService.loadingSubject.next(true);
				res.startDate = Utils.dateFormatForApi(res.startDate);
				res.endDate = Utils.dateFormatForApi(res.endDate);
				const httpHeaders = this.httpUtils.getHTTPHeaders();
				this.http.post('api/' + 'holusers' + '/report?startDate=' + res.startDate + '&endDate=' + res.endDate, undefined, { headers: httpHeaders, responseType: 'blob' })
					.pipe(
						tap(res2 => {
							Utils.downloadFile(res2, 'Excel', 'Toplu İzinler Raporu');
							this.baseService.loadingSubject.next(false);
						}),
						catchError(err => {
							this.baseService.loadingSubject.next(false);
							return err;
						})
					).subscribe();
			}
		});
	}
	// getChildren() {
	// 	this.baseService.find(undefined, 'User/HierarchicalChildren/' + this.current.id).subscribe((res) => {
	// 		this.children = res.body;
	// 	});
	// }
}
