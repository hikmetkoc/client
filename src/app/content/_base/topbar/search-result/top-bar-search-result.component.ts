// Angular
import { Component, Input } from '@angular/core';

@Component({
	selector: 'kt-top-bar-search-result',
	templateUrl: './top-bar-search-result.component.html',
	styleUrls: ['./top-bar-search-result.component.scss']
})
export class TopBarSearchResultComponent {
	// Public properties
	@Input() data: any[];
	@Input() noRecordText: string;
}
