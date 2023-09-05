import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";
import {Role} from "../../../../core/auth";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
	selector: 'kt-send-invoice',
	templateUrl: 'change-role.component.html',
})
export class ChangeRoleComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	roleId: any;
	userList = [];
	selectedUserId: any;

	constructor(
		private cdr: ChangeDetectorRef,
		public baseService: BaseService,
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public snackBar: MatSnackBar,
		private dateAdapter: DateAdapter<Date>
	) {
		if (data && data.model) {
			this.model = data.model;
		}
		if (data && data.current) {
			this.current = data.current;
		}
	}

	onNoClick() {
		this.dialogRef.close();
	}

	userRole() {
		this.current.roles.forEach((role: Role) => {
			this.roleId = role.id;
		});
	}
	onYesClick() {
		const selectedRole = this.selectedUserId;
		this.current.roles.forEach((role: Role) => {
			role.id = selectedRole;
		});
		this.baseService.update(this.current, 'users').subscribe(() => {
			Utils.showActionNotification('Rol güncellendi', 'success', 10000, true, false, 3000, this.snackBar);
			this.dialogRef.close();
		});
	}

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.getUsers();
		this.userRole();
	}

	formatDate(date: string): string {
		if (!date) return '';

		const formattedDate = new Date(date);
		const day = ('0' + formattedDate.getDate()).slice(-2);
		const month = ('0' + (formattedDate.getMonth() + 1)).slice(-2);
		const year = formattedDate.getFullYear();
		const hour = ('0' + formattedDate.getHours()).slice(-2);
		const minute = ('0' + formattedDate.getMinutes()).slice(-2);

		return `${day}-${month}-${year}`;
	}
	getUsers() {
		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'id', sortOrder: 'ASC' }],
			0,
			100
		);
		this.baseService.find(queryParams, 'roles').subscribe(res => {
			this.userList = res.body;
			this.cdr.markForCheck();
		});
	}

}
