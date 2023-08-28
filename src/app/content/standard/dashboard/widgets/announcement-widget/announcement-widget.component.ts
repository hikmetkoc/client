import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { LayoutConfigService } from '../../../../../core/_base/layout';

@Component({
	selector: 'kt-announcement-widget',
	templateUrl: './announcement-widget.component.html',
	styleUrls: ['./announcement-widget.component.scss']
})
export class AnnouncementWidgetComponent implements OnInit {

	@Input() data: any;

	@ContentChild('actionTemplate', { static: true }) actionTemplate: TemplateRef<any>;

	constructor(private layoutConfigService: LayoutConfigService) {
	}

	ngOnInit() {

	}
}
