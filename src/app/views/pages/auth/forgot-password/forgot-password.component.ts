// Angular
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// RxJS
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
// Translate
import { TranslateService } from '@ngx-translate/core';
// Auth
import { AuthNoticeService, AuthService } from '../../../../core/auth';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../content/_base/utils';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
	selector: 'kt-forgot-password',
	templateUrl: './forgot-password.component.html',
	encapsulation: ViewEncapsulation.None
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
	// Public params
	forgotPasswordForm: FormGroup;
	verificationCodeSent = false;
	// loading = false;
	errors: any = [];
	buttonLoading = false;

	private unsubscribe: Subject<any>; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

	/**
	 * Component constructor
	 *
	 * @param authService
	 * @param authNoticeService
	 * @param translate
	 * @param router
	 * @param fb
	 * @param cdr
	 */
	constructor(
		private authService: AuthService,
		public authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private router: Router,
		private fb: FormBuilder,
		private http: HttpClient,
		public snackBar: MatSnackBar,
		private cdr: ChangeDetectorRef
	) {
		this.unsubscribe = new Subject();
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.initRegistrationForm();
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		this.unsubscribe.next();
		this.unsubscribe.complete();
	}

	/**
	 * Form initalization
	 * Default params, validators
	 */
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


	/**
	 * Form Submit
	 */
	async submit() {
		const controls = this.forgotPasswordForm.controls;

		/** check form */
		/*if (this.forgotPasswordForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}*/

		const id = controls['id'].value;
		const url = `api/users/forgot?id=${id}`;
		this.buttonLoading = true;

		try {
			const res = await this.http.get(url).toPromise();
			if (res === 1) {
				this.verificationCodeSent = true;
				this.cdr.detectChanges();
			} else {
				this.buttonLoading = false;
			}
		} catch (error) {
			this.buttonLoading = false;
		}
	}

	submit2() {
		const controls = this.forgotPasswordForm.controls;
		/** check form */
		if (this.forgotPasswordForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}
		const id = controls['id'].value;
		const verificationCode = controls['verificationCode'].value;
		const newPassword = controls['newPassword'].value;
		const confirmPassword = controls['confirmPassword'].value;

		if (newPassword !== confirmPassword) {
			console.error('Şifreler uyuşmuyor');
			return;
		}
		const url = `api/users/changePw?id=${id}&pw=${newPassword}&code=${verificationCode}`;
		this.http.get(url)
			.subscribe(
				(res) => {
					this.router.navigate(['/auth/login']);
					this.cdr.detectChanges();
					Utils.showActionNotification('Şifreniz başarıyla değiştirilmiştir!', 'success', 2000, true, true, 2000, this.snackBar);
					},
				(error) => {
					Utils.showActionNotification('Hatalı işlem!', 'success', 2000, true, true, 2000, this.snackBar);
					return;
				}
			);
	}

	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
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
