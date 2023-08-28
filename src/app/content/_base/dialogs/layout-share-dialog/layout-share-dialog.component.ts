import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BaseService } from '../../base.service';
import { QueryParamsModel } from '../../models/query-params.model';

@Component({
	selector: 'kt-layout-share-dialog',
	templateUrl: './layout-share-dialog.component.html',
	styleUrls: ['./layout-share-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class LayoutShareDialogComponent implements OnInit {
	model: any;
	layout;

	usersList = [];
	usersToShare = [];

	constructor(
		public baseService: BaseService,
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) { }

	ngOnInit() {
		this.model = this.data.model;
		this.layout = this.data.layout;

		this.filterUsers();
	}

	onSubmit() {
		const _entity = {
			userIds: this.usersToShare,
			layoutId: this.layout.id
		};
		this.dialogRef.close(_entity);
	}

	onNoClick() {
		this.dialogRef.close();
	}

	filterUsers() {
		const params = new QueryParamsModel(
			undefined,
			[{ sortBy: 'Name', sortOrder: 'ASC' }, { sortBy: 'Surname', sortOrder: 'ASC' }],
			0,
			500
		);

		this.baseService.find(params, 'users/hierarchical-users?id=' + this.baseService.getUser().id).subscribe(res => {
			this.usersList = res.body;
		});
	}
}
