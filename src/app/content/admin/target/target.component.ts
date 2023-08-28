import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '../../_base/utils';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { ReportDialogComponent } from '../../_base/dialogs/report-dialog/report-dialog.component';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { HttpUtilsService } from '../../_base/http-utils.service';

@Component({
	selector: 'kt-target',
	templateUrl: './target.component.html',
	styleUrls: ['./target.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class TargetComponent implements OnInit, AfterViewInit {

	utils = Utils;
	year;
	years;
	months;
	data = {};
	users = [];

	constructor(
		private http: HttpClient,
		private httpUtils: HttpUtilsService,
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		private cdr: ChangeDetectorRef,
	) {
		const year = new Date().getFullYear();
		this.years = [
			(year + 1).toString(),
			(year + 0).toString(),
			(year - 1).toString(),
			(year - 2).toString(),
		];
		this.year = (year + 0).toString();
		this.months = Utils.getMonths();
	}

	ngOnInit() {
		this.getTargets();
	}

	ngAfterViewInit() {
	}

	getTargets() {
		this.data = {};
		this.users = [];
		this.cdr.markForCheck();
		this.baseService.find(undefined, 'targets/yearly?year=' + this.year).subscribe(res => {
			for (let row of res.body) {
				if (!this.data[row.owner.id]) {
					this.data[row.owner.id] = [];
					this.users.push(row.owner);
				}
				this.data[row.owner.id]['m' + (new Date(row.termStart).getMonth() + 1)] = row;
			}
			this.cdr.markForCheck();
		});
	}

	saveTargets() {
		const data = [];
		for (let user of this.users) {
			for (let m of this.months) {
				data.push(this.data[user.id][m.name]);
			}
		}
		this.baseService.update(data, 'targets/yearly?year=' + this.year).subscribe(() => {
			Utils.showActionNotification('Başarı ile Kaydedildi', 'success', 10000, true, false, 3000, this.snackBar);
			this.getTargets();
		});
	}

	getReport() {
		const dialogRef = this.dialog.open(ReportDialogComponent, { data: { filter: 'year', title: 'Hedef Raporu' } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				if (this.baseService.loadingSubject.value) { return; }
				this.baseService.loadingSubject.next(true);
				const httpHeaders = this.httpUtils.getHTTPHeaders();
				this.http.post('api/targets/report?year=' + res.year, undefined, { headers: httpHeaders, responseType: 'blob' })
					.pipe(
						tap(res2 => {
							Utils.downloadFile(res2, 'Excel', 'HedefRaporu');
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
}
