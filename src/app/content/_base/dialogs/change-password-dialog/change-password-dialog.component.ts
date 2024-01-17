import {Component, Inject, Input, OnInit, ViewEncapsulation} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Utils} from '../../utils';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HttpUtilsService} from '../../http-utils.service';

@Component({
	selector: 'kt-change-password-dialog',
	templateUrl: './change-password-dialog.component.html',
	styleUrls: ['./change-password-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class ChangePasswordDialogComponent implements OnInit {
	viewLoading = false;
	forgotPasswordForm: FormGroup;
	errors: any = [];
	@Input() current: any;
	@Input() model: any;

	constructor(
		public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
		private fb: FormBuilder,
		private http: HttpClient,
		public snackBar: MatSnackBar,
		private httpUtils: HttpUtilsService,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		if (data && data.model) {
			this.model = data.model;
		}
		if (data && data.current) {
			this.current = data.current;
		}
	}

	ngOnInit() {
		this.initRegistrationForm();
		this.model = this.data.model;
		this.current = this.data.current;
	}
	initRegistrationForm() {
		this.forgotPasswordForm = this.fb.group({
			id: ['', Validators.compose([
				Validators.required,
				Validators.minLength(6),
				Validators.maxLength(320)
			])],
			verificationCode: ['', Validators.compose([
				Validators.required,
				Validators.minLength(6),
				Validators.maxLength(320)
			])],
			newPassword: ['', Validators.compose([
				Validators.required,
				Validators.minLength(6),
				Validators.maxLength(320)
			])],
			confirmPassword: ['', Validators.compose([
				Validators.required,
				Validators.minLength(6),
				Validators.maxLength(320)
			])],
		});
	}
	onNoClick(): void {
		this.dialogRef.close();
	}

	onYesClick(): void {
		/* Server loading imitation. Remove this */
		this.viewLoading = true;
		const controls = this.forgotPasswordForm.controls;
		/** check form */
		const id = this.current;
		const newPassword = controls['newPassword'].value;
		const confirmPassword = controls['confirmPassword'].value;

		if (newPassword !== confirmPassword) {
			console.error('Şifreler uyuşmuyor');
			return;
		}
		if (newPassword.toString().length < 6) {
			Utils.showActionNotification('Şifreniz en az 6 karakterli olmalıdır!', 'success', 2000, true, true, 2000, this.snackBar);
			this.viewLoading = false;
			return;
		}
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `api/users/changePassword?id=${id}&pw=${newPassword}`;
		this.http.get(url, {headers: httpHeaders})
			.subscribe(
				(res) => {
					Utils.showActionNotification('Şifreniz başarıyla değiştirilmiştir!', 'success', 2000, true, true, 2000, this.snackBar);
				},
				(error) => {
					Utils.showActionNotification('Hatalı işlem!', 'success', 2000, true, true, 2000, this.snackBar);
				}
			);
		setTimeout(() => {
			this.dialogRef.close(true); // Keep only this row
		}, 2500);
	}
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.forgotPasswordForm.controls[controlName];
		if (!control) {
			return false;
		}

		const result =
			control.hasError(validationType) &&
			(control.dirty || control.touched);
		return result;
	}
}
