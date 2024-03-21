// Angular
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, tap} from "rxjs/operators";
import {Utils} from "../../../../../content/_base/utils";
import {HttpUtilsService} from "../../../../../content/_base/http-utils.service";
import {BaseService} from "../../../../../content/_base/base.service";

@Component({
	selector: 'kt-cart',
	templateUrl: './cart.component.html',
	styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, AfterViewInit {
	// Public properties

	// Set icon class name
	@Input() icon: string = 'flaticon2-download';
	@Input() iconType: '' | 'brand';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	// Set bg image path
	@Input() bgImage: string;

	/**
	 * Component constructor
	 */
	constructor(private http: HttpClient,
				         private httpUtils: HttpUtilsService,
				         public baseService: BaseService) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * After view init
	 */
	ngAfterViewInit(): void {
	}

	/**
	 * On init
	 */
	ngOnInit(): void {
	}

	downloadFile() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		this.http.post('api/mobile/download-apk', undefined, { headers: httpHeaders, responseType: 'blob' })
			.pipe(
				tap(res2 => {
					Utils.downloadFile(res2, 'Apk', 'Meteor Panel');
					this.baseService.loadingSubject.next(false);
				}),
				catchError(err => {
					this.baseService.loadingSubject.next(false);
					return err;
				})
			).subscribe();
	}
}
