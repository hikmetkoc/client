import { Component, ChangeDetectionStrategy, Input, AfterViewInit, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ReportManagerToolComponent } from './reportmanagertool/reportmanagertool.component';
import { ReportManagerDialogComponent } from './report-manager-dialog/report-manager-dialog.component';

@Component({
	selector: 'kt-reportmanager',
	templateUrl: './reportmanager.component.html',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.Default
})
export class ReportManagerComponent implements AfterViewInit, OnInit {

	@Input() current: any;
	@Input() model: any;
	@ViewChild(ReportManagerToolComponent, undefined) fileManagerTool;
	files: any;

	constructor(
		public dialog: MatDialog
	) {
	}

	ngOnInit() {
	}

	ngAfterViewInit() {

	}

	showFiles() {
		const dialogRef = this.dialog.open(ReportManagerDialogComponent, {
			width: '800px',
			data: { current: this.current, model: this.model }
		});
		dialogRef.afterClosed().subscribe(() => {
		});
	}
}
