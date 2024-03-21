import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface Timeline2Data {
	text: string;
	icon?: string;
	attachment?: string;
}

@Component({
	selector: 'kt-contact-widget',
	templateUrl: './contacts-widget.component.html',
	styleUrls: ['./contacts-widget.component.scss']
})
export class ContactsWidgetComponent implements OnInit {

	@Input() data;

	constructor(
		public router: Router
	) {

	}

	ngOnInit() {

	}
}
