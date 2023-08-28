import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface Timeline2Data {
	text: string;
	icon?: string;
	attachment?: string;
}

@Component({
	selector: 'kt-birthday-widget',
	templateUrl: './birthday-widget.component.html',
	styleUrls: ['./birthday-widget.component.scss']
})
export class BirthdayWidgetComponent implements OnInit {

	@Input() data;

	constructor(
		public router: Router
	) {

	}

	ngOnInit() {

	}

	taskRowClicked(row) {
		this.router.navigate(['/users'], { queryParams: { id: row.id, sourceObject: 'dashboard', sourceId: row.id } });
	}
}
