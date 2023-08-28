import { Component, ChangeDetectionStrategy, AfterViewInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { BaseService } from '../base.service';
import { ActivatedRoute } from '@angular/router';
import { FilterDialogComponent } from '../dialogs/filter-dialog/filter-dialog.component';
import { Utils } from '../utils';

@Component({
	selector: 'kt-pageheader',
	templateUrl: './pageheader.component.html',
	styleUrls: ['./pageheader.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})
export class PageHeaderComponent implements AfterViewInit {

	@Input() activeFilter;
	@Input() filters;
	@Input() buttons = [];
	@Input() model;

	@Input() layout;
	@Output() layoutChange = new EventEmitter<any>();

	@Output() filterChange = new EventEmitter<any>();
	@Output() searchChange = new EventEmitter<string>();
	@Output() exportFile = new EventEmitter<string>();

	searchStr;
	utils = Utils;

	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public baseService: BaseService,
		public route: ActivatedRoute
	) { }

	ngAfterViewInit() {
	}

	showFilterDialog() {
		const dialogRef = this.dialog.open(FilterDialogComponent, { data: { layout: this.layout, model: this.model } });
		dialogRef.afterClosed().subscribe(() => {
			this.layoutChange.emit(this.layout);
		});
	}
}

