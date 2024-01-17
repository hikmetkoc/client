// Angular
import { Component, Input, OnInit } from '@angular/core';
// RxJS
import { Observable } from 'rxjs';
// NGRX
import { select, Store } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';
import { currentUser, Logout, User } from '../../../../../core/auth';
import {
	PaymentOrderFileDialogComponent
} from "../../../../../content/_base/dialogs/payment-order-file-dialog/payment-order-file-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {
	ConnectStoreDialogComponent
} from "../../../../../content/_base/dialogs/connect-store-dialog/connect-store-dialog.component";
import {Utils} from "../../../../../content/_base/utils";
import {
	ChangePasswordDialogComponent
} from "../../../../../content/_base/dialogs/change-password-dialog/change-password-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BaseService} from "../../../../../content/_base/base.service";

@Component({
	selector: 'kt-user-profile2',
	templateUrl: './user-profile2.component.html',
})
export class UserProfile2Component implements OnInit {
	// Public properties
	user$: Observable<User>;

	@Input() avatar = true;
	@Input() greeting = true;
	@Input() badge: boolean;
	@Input() icon: boolean;

	constructor(private store: Store<AppState>, public dialog: MatDialog, public snackBar: MatSnackBar, public baseService: BaseService) {
	}

	ngOnInit(): void {
		this.user$ = this.store.pipe(select(currentUser));
	}

	logout() {
		this.store.dispatch(new Logout());
	}
	changePw() {
		const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {data: {current: this.baseService.getUser().login, model: 'this.model'}});
		dialogRef.afterClosed().subscribe(res => {
			if (res === true) {
				Utils.showActionNotification('Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
			}
		});
	}
}
