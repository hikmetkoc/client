import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface Timeline2Data {
	text: string;
	attachment?: string;
}

@Component({
	selector: 'kt-taskstatus-widget',
	templateUrl: './taskstatus-widget.component.html',
	styleUrls: ['./taskstatus-widget.component.scss']
})
export class TaskStatusWidgetComponent implements OnInit {

	@Input() data;

	constructor(
		public router: Router
	) {

	}

	ngOnInit() {

	}
/*
	taskRowClicked(row) {
		this.router.navigate(['/users'], { queryParams: { id: row.id, sourceObject: 'tasks', sourceId: row.id } });
	}*/
}
