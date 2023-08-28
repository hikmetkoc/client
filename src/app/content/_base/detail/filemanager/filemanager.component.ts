import { Component, ChangeDetectionStrategy, Input, AfterViewInit, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FileManagerToolComponent } from './filemanagertool/filemanagertool.component';
import { FileManagerDialogComponent } from './file-manager-dialog/file-manager-dialog.component';

@Component({
	selector: 'kt-filemanager',
	templateUrl: './filemanager.component.html',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.Default
})
export class FileManagerComponent implements AfterViewInit, OnInit {

	@Input() current: any;
	@Input() model: any;
	@ViewChild(FileManagerToolComponent, undefined) fileManagerTool;
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
		const dialogRef = this.dialog.open(FileManagerDialogComponent, {
			width: '800px',
			data: { current: this.current, model: this.model }
		});
		dialogRef.afterClosed().subscribe(() => {
		});
	}
}
