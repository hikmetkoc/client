import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import { MatBottomSheetRef, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import {QueryParamsModel} from "../../models/query-params.model";
import {Utils} from "../../utils";
import {BaseService} from "../../base.service";
import {Role} from "../../../../core/auth";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
	selector: 'kt-send-invoice',
	templateUrl: 'change-group.component.html',
})
export class ChangeGroupComponent implements OnInit {

	@Input() current: any;
	@Input() model: any;
	roleId: any;
	groupId: any;
	userList = [];
	userGroupList = [];
	filteredProducts = [];
	selectedGroupId: any;
	selectedMemberId: any;

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

	onStoreSelectionChange() {
		// Burada seçilen mağazaya göre verileri güncelleyin.
		// Örnek: Seçilen mağaza ID'sini kullanarak yeni verileri alın veya bir hizmeti çağırın.
		// Güncellenmiş verileri bir değişkende saklayabilirsiniz.
		this.updateTableData();
	}

	updateTableData() {
		// Tablo verilerini güncellemek için bu işlevi kullanabilirsiniz.
		// Güncellenmiş verileri tabloya atayarak tabloyu yenileyebilirsiniz.
		this.filteredProducts = this.userList;

	}
	onNoClick() {
		this.dialogRef.close();
	}

	userGroup() {
		/*this.current.groups.forEach((group: any) => {
			this.groupId = group.firstName + ' ' + group.lastName;
		});*/

		const filters = new Set();
		const queryParams = new QueryParamsModel(
			Utils.makeFilter(filters),
			[{ sortBy: 'siralama', sortOrder: 'ASC' }],
			0,
			1000
		);
		this.baseService.find(queryParams, 'users').subscribe(res => {
			this.userGroupList = res.body.filter(user => user.id === this.current.id);
			this.cdr.markForCheck();
		});
	}
	onYesClick() {
		const selectedGroup = this.selectedGroupId;
		this.current.groups.forEach((group: any) => {
			console.log(group);
			//group.id =  selectedGroup;
		});

		/*const selectedMember = this.selectedMemberId;
		this.current.members.forEach((member: any) => {
			member.id = selectedMember;
		});*/
		/*this.baseService.update(this.current, 'users').subscribe(() => {
			Utils.showActionNotification('Grup güncellendi', 'success', 3000, true, false, 3000, this.snackBar);
			this.dialogRef.close();
		});*/
	}

	ngOnInit() {
		this.model = this.data.model;
		this.current = this.data.current;
		this.getUsers();
		this.userGroup();
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
			[{ sortBy: 'siralama', sortOrder: 'ASC' }],
			0,
			1000
		);
		this.baseService.find(queryParams, 'users').subscribe(res => {
			this.userList = res.body.filter(user => user.activated === true);
			this.cdr.markForCheck();
		});
	}

}
