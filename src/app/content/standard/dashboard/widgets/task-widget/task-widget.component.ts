import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface Timeline2Data {
	time: string;
	text: string;
	icon?: string;
	attachment?: string;
}

@Component({
	selector: 'kt-task-widget',
	templateUrl: './task-widget.component.html',
	styleUrls: ['./task-widget.component.scss']
})
export class TaskWidgetComponent implements OnInit {

	@Input() data;

	constructor(
		public router: Router
	) {

	}

	ngOnInit() {

	}

	taskRowClicked(row) {
		this.router.navigate(['/task'], { queryParams: { id: row.id, sourceObject: 'dashboard', sourceId: row.id } });
	}
}
