import { Component, ChangeDetectionStrategy, AfterViewInit, OnInit, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import { BaseService } from '../base.service';
import { Utils } from '../utils';

@Component({
	selector: 'kt-simpletable',
	templateUrl: './simpletable.component.html',
	styleUrls: ['./simpletable.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleTableComponent implements AfterViewInit, OnInit, OnChanges {

	@Input() data;
	utils;
	displayedColumns = [];

	constructor(
		public baseService: BaseService
	) {
		this.utils = Utils;
	}

	ngOnInit() {
		Utils.getModels();
	}

	ngAfterViewInit() {
	}

	ngOnChanges() {
		this.makeColumns();
	}

	makeColumns() {
		if (this.data && this.data.length > 0) {
			this.displayedColumns = Object.keys(this.data[0]);
		}
	}
}
