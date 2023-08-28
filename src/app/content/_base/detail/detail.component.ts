import { Component, ChangeDetectionStrategy, Input, AfterViewInit, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Utils } from '../utils';
import { BaseService } from '../base.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteEntityDialogComponent } from '../dialogs/delete-entity-dialog/delete-entity-dialog.component';
import {ReportManagerDialogComponent} from "./reportmanager/report-manager-dialog/report-manager-dialog.component";
import {HolidayDetailDialogComponent} from "./reportmanager/holiday-detail-dialog/holiday-detail-dialog.component";

@Component({
	selector: 'kt-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.Default
})
export class DetailComponent implements AfterViewInit, OnInit {

	@Input() current: any;
	@Input() model: any;
	@Input() naked = false;
	@Input() tiny = false;
	@Input() buttons = [];
	@Input() holiday: any;

	@Output() currentChange = new EventEmitter();
	@Output() editClick = new EventEmitter();
	@Output() editClick2 = new EventEmitter();
	@Output() resetCurrent = new EventEmitter();
	modelRows = [];
	bubbleObject: any;
	bubbleModel: any;
	defaultFilter = [];
	defaultValues = [];

	constructor(
		public baseService: BaseService,
		public snackBar: MatSnackBar,
		public route: ActivatedRoute,
		public dialog: MatDialog,
		private router: Router
	) {
	}

	ngOnInit() {
		this.makeCols();
		this.editClick2.subscribe((holiday: any) => {
			// holiday nesnesini düzenleme işlemini gerçekleştir
		});
	}

	ngAfterViewInit() {

	}

	makeCols() {
		let i = 0;
		for (const field of this.model.fields) {
			if (!field.active) { continue; }
			if (!this.modelRows[i % 4]) { this.modelRows[i % 4] = []; }
			this.modelRows[i % 4].push(field);
			i++;
		}
	}

	roundUp(num: number): number {
		return Math.ceil(num);
	}
	showHolidayDetail() {
		const dialogRef = this.dialog.open(HolidayDetailDialogComponent, {
			width: '1200px',
			data: { current: this.current, model: this.model }
		});
		dialogRef.afterClosed().subscribe(() => {
		});
	}

	bubbleOpen(object, apiName) {
		this.bubbleObject = object;
		this.bubbleModel = Utils.getModel(apiName);

		this.baseService.findById(this.bubbleObject.id, apiName).subscribe(res => {
			if (res.body.length === 1) {
				this.bubbleObject = res.body[0];
			} else {
				Utils.showActionNotification('Öğe bulunamadı. Öğeyi görmeye yetkiniz olmayabilir.', 'warning', 10000, true, false, 3000, this.snackBar);
			}
		});
	}

	delete(_item: any, e) {
		if (e) { e.stopPropagation(); }

		const dialogRef = this.dialog.open(DeleteEntityDialogComponent, {
			data: {},
			width: '440px'
		});
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.baseService.delete(_item.id, this.model.apiName).subscribe(() => {
				Utils.showActionNotification('Silindi', 'success', 10000, true, false, 3000, this.snackBar);
				this.resetCurrent.emit();
			});
		});
	}
	holidayRowClicked(row) {
		const holidayModel = {
			id: row.id,
			sourceObject: 'holiday',
			sourceId: this.current['id']
		};
		this.editClick.emit(holidayModel);
	}
	onEditClick() {
		this.editClick2.emit(this.current);
	}

}
