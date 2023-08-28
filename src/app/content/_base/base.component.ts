import { ViewChild } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from './base.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from './utils';
import { Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

export class BaseComponent {

	@ViewChild('mainGrid', undefined) mainGrid;
	model;
	name: string;
	current;
	params: any = {};
	paramMap: any = {};
	entity: string;
	loading$: Observable<boolean>;
	isMobile = false;
	buttons = [];

	constructor(
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver
	) {
		this.router.routeReuseStrategy.shouldReuseRoute = function () {
			return false;
		};

		this.loading$ = this.baseService.loadingSubject.asObservable();

		breakpointObserver.observe([
			Breakpoints.XSmall,
			Breakpoints.Small
		]).subscribe(result => {
			if (result.matches) {
				this.isMobile = true;
			} else {
				this.isMobile = false;
			}
		});
	}

	init() {
		this.route.queryParams.subscribe(params => {
			this.params = params;
		});

		this.route.paramMap.subscribe(paramMap => {
			this.paramMap = paramMap;
		});

		if (this.paramMap.get('id')) {
			this.baseService.findById(this.paramMap.get('id'), this.model.apiName).subscribe(res => {
				if (res.body.length === 1) {
					this.rowClicked(res.body[0]);
				}
			});
		}
	}

	afterViewInit() {
		if (this.params.mode === 'create') {
			setTimeout(function () {
				this.mainGrid.add();
			}.bind(this), 0);
		}

		if (this.params.id) {
			this.reloadCurrent(this.params.id);
		}
	}

	resetCurrent() {
		this.route.queryParams.subscribe(params => {
			if (params.sourceObject && params.sourceId) {
				this.router.navigate(['/' + params.sourceObject], { queryParams: { id: params.sourceId } });
			} else {
				this.current = undefined;
				this.mainGrid.loadList();
			}
		});
	}

	reloadCurrent(id?) {
		if (!id) { id = this.current.id; }
		this.baseService.findById(id, this.model.apiName).subscribe(res => {
			if (res.body.length === 1) {
				this.rowClicked(res.body[0]);
			} else {
				//Utils.showActionNotification('Öğe bulunamadı. Öğeyi görmeye yetkiniz olmayabilir.', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		});
	}

	rowClicked(row: any) {
		this.current = row;
	}

	listChange() {
		if (this.current) {
			this.reloadCurrent();
		}
	}
}
