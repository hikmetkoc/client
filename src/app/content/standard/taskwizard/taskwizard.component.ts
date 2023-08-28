import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef, Input } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Utils } from '../../_base/utils';
import { Observable } from 'rxjs';
import { QueryParamsModel } from '../../_base/models/query-params.model';
import { FilterOperation } from '../../_base/models/filter';
import { tap } from 'rxjs/operators';

@Component({
	selector: 'kt-taskwizard',
	templateUrl: './taskwizard.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['./taskwizard.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class TaskWizardComponent implements OnInit, AfterViewInit {

	@Input() user;

	loading$: Observable<boolean>;
	utils = Utils;
	data;
	displayedColumns = [];
	currentDate = new Date();
	weekDays;

	constructor(
		private cdr: ChangeDetectorRef,
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver,
	) {
		this.utils = Utils;

		this.loading$ = this.baseService.loadingSubject.asObservable();
	}

	ngOnInit() {
		this.getTasks();
	}

	ngAfterViewInit() {

	}

	makeData(rows) {
		const data = [];
		for (let i = 7; i <= 23; i++) {
			let a: any = {};
			a.hour = i;
			a.hourF = i.toString().padStart(2, '0') + ':00';
			for (let d of this.weekDays) {
				const dueTime = new Date(JSON.parse(JSON.stringify(d.date)));
				dueTime.setHours(i);
				a[d.name] = {
					dueTime,
					description: ''
				};
			}
			data.push(a);
		}
		this.data = data;

		this.displayedColumns = [];
		this.displayedColumns.push('hour');
		for (let d of this.weekDays) {
			this.displayedColumns.push(d.name);
		}
		for (let row of rows) {
			const dueTime = new Date(row.dueTime);
			this.data[dueTime.getHours() - 7]['d' + (dueTime.getDay() === 0 ? 7 : dueTime.getDay())] = row;
		}

		this.cdr.markForCheck();
	}

	getTasks(date = new Date()) {
		this.weekDays = Utils.getWeekDays(this.currentDate);

		const model = new QueryParamsModel();

		const filters = new Set();
		filters.add({
			name: 'dueTime',
			operator: FilterOperation.GREATER_OR_EQUAL_THAN,
			value: new Date(JSON.parse(JSON.stringify(this.weekDays[0].date)))
		});
		const lastDate = new Date(JSON.parse(JSON.stringify(this.weekDays[6].date)));
		lastDate.setDate(lastDate.getDate() + 1);
		filters.add({
			name: 'dueTime',
			operator: FilterOperation.LESS_THAN,
			value: lastDate
		});
		filters.add({
			name: 'type',
			operator: FilterOperation.EQUALS,
			value: 'Gör_Tip_Kolay_Ajanda'
		});
		if (this.user) {
			filters.add({
				name: 'assigner.id',
				operator: FilterOperation.EQUALS,
				value: this.user.id
			});
		} else {
			filters.add({
				name: 'assigner.id',
				operator: FilterOperation.EQUALS,
				value: this.user ? this.user.id : this.baseService.getUser().id
			});
		}
		model.filter = Utils.makeFilter(filters);
		model.size = 100;
		model.sorts = [{ sortBy: 'createdDate', sortOrder: 'DESC' }];
		this.baseService.find(model, 'tasks').pipe(
			tap(res => {
				this.makeData(res.body);
				this.cdr.markForCheck();
			}),
		).subscribe();
	}

	save() {
		const tasks = [];
		for (const row of this.data) {
			for (const day of this.weekDays) {
				if (row[day.name].description !== '') {
					tasks.push(row[day.name]);
				}
			}
		}
		this.baseService.update(tasks, 'tasks/weekly').subscribe(() => {
			Utils.showActionNotification('Ajanda güncellendi', 'success', 10000, true, false, 3000, this.snackBar);
			this.getTasks();
		});
	}

	prevWeek() {
		this.currentDate.setDate(this.currentDate.getDate() - 7);
		this.getTasks();
	}

	nextWeek() {
		this.currentDate.setDate(this.currentDate.getDate() + 7);
		this.getTasks();
	}

	trackByIndex(i) { return i; }
}
