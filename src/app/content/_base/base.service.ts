import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpUtilsService } from './http-utils.service';
import {tap, catchError, map} from 'rxjs/operators';
import { QueryParamsModel } from './models/query-params.model';
import { QueryResultsModel } from './models/query-results.model';
import { Utils } from './utils';
import { MatSnackBar } from '@angular/material';
import { Filter } from './models/filter';
import { Store } from '@ngrx/store';
import { Logout } from '../../core/auth';
import { AppState } from '../../core/reducers';
import { utils } from 'protractor';


@Injectable()
export class BaseService {

	url: string;
	prefix = '/api/';
	requests$ = new Subject<any>();
	queue: PendingRequest[] = [];
	loadingSubject = new BehaviorSubject<boolean>(false);
	timer: any;
	entityToMerge: any;
	attrs: any;
	attrVals: any;

	constructor(
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		public snackBar: MatSnackBar,
		private store: Store<AppState>) {
	}

	update(entity: any, forceURL?: any): Observable<any> {
		this.loadingSubject.next(true);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(this.prefix + (forceURL || this.url), entity, {headers: httpHeaders}).pipe(
			tap(res => {
				this.loadingSubject.next(false);
			}),
			catchError(err => {
				this.loadingSubject.next(false);
				if (err.status === 401) {
					this.logout();
				}
				if (err.error.detail) {
					Utils.showActionNotification(err.error.detail, 'warning', 10000, true, false, 3000, this.snackBar);
				} else {
					Utils.showActionNotification('Kaydetme Hatası', 'warning', 10000, true, false, 3000, this.snackBar);
				}
				return err;
			})
		);
	}

	updateStatus(entities: any[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			entities,
			newStatus: status
		};
		const url = this.prefix + this.url + '/UpdateStatus';
		return this.http.put(url, body, {headers: httpHeaders});
	}

	delete(id: any, forceURL?: string): Observable<any> {
		this.loadingSubject.next(true);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.delete(this.prefix + (forceURL || this.url) + '/?id=' + id, {headers: httpHeaders}).pipe(
			tap(res => {
				this.loadingSubject.next(false);
			}),
			catchError(err => {
				this.loadingSubject.next(false);
				if (err.status === 401) {
					this.logout();
				}
				if (err.error.detail) {
					Utils.showActionNotification(err.error.detail, 'warning', 10000, true, false, 3000, this.snackBar);
				} else {
					Utils.showActionNotification('Silme Hatası', 'warning', 10000, true, false, 3000, this.snackBar);
				}
				return err;
			})
		);
	}

	find(params: any, forceURL?: string) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const sub = new Subject<any>();
		const request = new PendingRequest(this.prefix + (forceURL || this.url) + '', params, {
			headers: httpHeaders,
			observe: 'response' as 'body'
		}, sub);

		this.queue.push(request);
		if (this.queue.length === 1) {
			this.startNextRequest();
		} else if (this.queue.length === 2) {
			this.queue.shift();
			this.startNextRequest();
		} else {
			if (this.timer) {
				clearTimeout(this.timer);
			}
			this.timer = setTimeout(function () {
				this.queue.shift();
				this.startNextRequest();
			}.bind(this), 1000);
		}
		return sub;
	}

	findById(id: number, forceURL?: any): Observable<any> {
		const params = new QueryParamsModel();
		const filters = new Set();
		filters.add({
			name: 'id',
			operator: 'EQUALS',
			value: id
		});
		params.filter = Utils.makeFilter(filters);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const sub = new Subject<any>();
		const request = new PendingRequest(this.prefix + (forceURL || this.url) + '', params, {
			headers: httpHeaders,
			observe: 'response' as 'body'
		}, sub);

		this.queue.push(request);
		if (this.queue.length === 1) {
			this.startNextRequest();
		} else if (this.queue.length === 2) {
			this.queue.shift();
			this.startNextRequest();
		} else {
			if (this.timer) {
				clearTimeout(this.timer);
			}
			this.timer = setTimeout(function () {
				this.queue.shift();
				this.startNextRequest();
			}.bind(this), 1000);
		}
		return sub;
	}

	findLatestQuote(id: number, forceURL?: any): Observable<any> {
		const params = new QueryParamsModel();
		const filters = new Set();
		filters.add({
			name: 'id',
			operator: 'EQUALS',
			value: id
		});
		params.filter = Utils.makeFilter(filters);
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const sub = new Subject<any>();
		const request = new PendingRequest(this.prefix + (forceURL || this.url) + '', params, {
			headers: httpHeaders,
			observe: 'response' as 'body'
		}, sub);

		this.queue.push(request);
		if (this.queue.length === 1) {
			this.startNextRequest();
		} else if (this.queue.length === 2) {
			this.queue.shift();
			this.startNextRequest();
		} else {
			if (this.timer) {
				clearTimeout(this.timer);
			}
			this.timer = setTimeout(function () {
				this.queue.shift();
				this.startNextRequest();
			}.bind(this), 1000);
		}
		return sub;
	}

	startNextRequest() {
		this.loadingSubject.next(true);

		if (this.queue.length > 1) {
		}

		if (this.queue.length > 0) {
			this.execute(this.queue[0]);
		} else {
			this.loadingSubject.next(false);
		}
	}

	/*webPushSettings(title: string, message: string) {
		if ('Notification' in window && Notification.permission === 'granted') {
			// Kullanıcı izni zaten alındı, bildirim gönder
			this.sendNotification(title, message);
		} else if ('Notification' in window) {
			// Kullanıcı izni alınmamış, izin iste
			Notification.requestPermission().then(permission => {
				if (permission === 'granted') {
					// Kullanıcı izni verildi, bildirim gönder
					this.sendNotification(title, message);
				}
			});
		}
	}

	sendNotification(title: string, message: string) {
		if (Notification.permission === 'granted') {
			const notification = new Notification(title, {
				body: message
			});
		}
	}*/
	execute(requestData: PendingRequest) {
		// this.baseService.isAuthorized().subscribe(res => {
		// });
		const req = this.http.post<any>(requestData.url, requestData.params, requestData.options)
			.pipe(
				tap(res => {
					const sub = requestData.subscription;
					sub.next(res);
					if (res['headers'].get('backend-version') !== JSON.parse(localStorage.getItem('backendVersion'))) {
						Utils.cleanLocalStorage();
						location.reload();
					}
					this.queue.shift();
					this.startNextRequest();
				}),
				catchError(err => {
					if (err.status === 401) {
						this.logout();
					}
					if (err.error.detail) {
						Utils.showActionNotification(err.error.detail, 'warning', 10000, true, false, 3000, this.snackBar);
					} else {
						Utils.showActionNotification('Bir hata oluştu', 'warning', 3000, true, false, 3000, this.snackBar);
					}
					this.queue.shift();
					this.startNextRequest();
					return err;
				})
			).subscribe();
		// this.baseService.refreshLoginChecker();
	}

	public getPermissionRule(object, type) {
		// if (!this.permissions) {
		// 	this.permissions = {};
		// 	for (const permission of this.tokenStorage.getPermissionRules()) {
		// 		this.permissions[permission.objectName] = {};
		// 		this.permissions[permission.objectName]['read'] = permission.read;
		// 		this.permissions[permission.objectName]['update'] = permission.update;
		// 		this.permissions[permission.objectName]['delete'] = permission.delete;
		// 	}
		// }
		// return this.permissions[object] ? this.permissions[object][type] : false;

		return true;
	}

	public logout(): void {
		console.log('logout');
		this.store.dispatch(new Logout());
	}

	public refreshLoginInfo() {

	}

	// Örnek: this.baseService.getAttrByVal('User.Type', 'Kullanıcı Grubu').id
	public getAttrByVal(attr: string, attrVal: string) {
		// const vals = this.getAttr(attr).values;
		// for (const val of vals) {
		// 	if (val.name === attrVal) { return val; }
		// }Cont
		return undefined;
	}

	// Örnek: this.baseService.getAttrById('User.Type', 12).id
	public getAttrById(attr: string, id: any) {
		// const vals = this.getAttr(attr).values;
		// for (const val of vals) {
		// 	if (val.id === id) { return val; }
		// }
		return undefined;
	}

	public getAttrVal(id: any) {
		if (!id) {
			return {name: ''};
		}
		if (this.attrVals === undefined) {
			this.makeAttrs();
		}
		return this.attrVals[id];
	}

	public getAttr(id: any) {
		if (this.attrs === undefined) {
			this.makeAttrs();
		}
		return this.attrs[id];
	}

	private makeAttrs() {
		this.attrs = {};
		this.attrVals = {};
		const vals = JSON.parse(localStorage.getItem('attributeValues'));
		vals.sort((a, b) => a.weight - b.weight);
		for (const val of vals) {
			const attribute = val.attribute;
			val.attribute = undefined;
			if (!this.attrs[attribute.id]) {
				this.attrs[attribute.id] = attribute;
				this.attrs[attribute.id].values = [];
			}
			this.attrs[attribute.id].values.push(val);
			this.attrVals[val.id] = val;
		}
	}

	public getConfiguration(subject) {
		// if (!this.configurations) {
		// 	this.configurations = {};
		// 	for (const config of this.tokenStorage.getConfigurations()) {
		// 		this.configurations[config.name] = config.value;
		// 	}
		// }
		// return this.configurations[subject];
		return undefined;
	}

	public getUser(): any {
		const user = JSON.parse(localStorage.getItem('user'));
		return user;
	}

	public getUserId(): number {
		const user = this.getUser();
		return user ? user.id : undefined;
	}

	public getUserFullName(): string {
		const user = this.getUser();
		return user ? user.firstName + ' ' + user.lastName : undefined;
	}

	public getMuhUser(): boolean {
		const user = this.getUser();
		const unvan = user.unvan.id;
		if (unvan === 'Unvan_Muh_Uzm') {
			return true;
		} else {
			return false;
		}
	}
	public getRoleId(): string {
		const role = this.getUser().roles;
		return role ? role[0].id : undefined;
	}

	public getIzinCheck(): boolean {
		// todo: USERPERMISSION TABLOSUNDAKİ MAVİ YAKA İZİN GÖRÜNTÜLEME YETKİSİNİ KONTROL ET...
		const izin = this.getUser();
		return izin ? izin.izinGoruntuleme : false;

		/*const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `api/user_permissions/controlholiday?id=${this.getUserId()}`;
		this.http.put(url, null, {headers: httpHeaders, responseType: 'text'})
			.subscribe((res) => {
				return true;
			});*/
	}
	/*getIzinCheck(): Observable<boolean> {
		const url = `api/user_permissions/controlholiday/${this.getUserId()}`;

		return this.http.get(url).pipe(
			map((response: any) => {
				// Burada HTTP yanıtını işleyip kullanıcının izinlerini kontrol edebilirsiniz.
				console.log(response);
				const izin = response; // Örneğin, HTTP yanıtında izin nesnesi varsa
				return izin;
			})
		);
	}*/
}

export class PendingRequest {
	url: string;
	params: QueryParamsModel;
	options: any;
	subscription: Subject<any>;

	constructor(url: string, params: QueryParamsModel, options: any, subscription: Subject<any>) {
		this.url = url;
		this.params = params;
		this.options = options;
		this.subscription = subscription;
	}
}
