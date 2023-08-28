import { Component, ChangeDetectionStrategy, Input, AfterViewInit, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseService } from '../../base.service';

@Component({
	selector: 'kt-history',
	templateUrl: './history.component.html',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent implements AfterViewInit, OnInit {

	@Input() current: any;
	@Input() model: any;
	logs: any;

	constructor(
		private modalService: NgbModal,
		public baseService: BaseService	) {
	}

	ngOnInit() {
	}

	ngAfterViewInit() {

	}

	showFiles(content) {
		this.loadList();
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	loadList() {
		this.baseService.find({}, 'EntityLog?' + 'objectName=' + this.model.apiName + '&entityId=' + this.current.id).subscribe(res2 => {
			this.logs = res2.body.result;
		});
	}
}
