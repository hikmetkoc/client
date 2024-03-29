// Angular
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import {Utils} from '../../../../../content/_base/utils';

@Component({
	selector: 'kt-administration',
	templateUrl: './administration.component.html',
	styleUrls: ['./administration.component.scss'],
})
export class AdministrationComponent implements OnInit, AfterViewInit {
	// Public properties
	utils = Utils;
	// Set icon class name
	@Input() icon = 'flaticon2-gear';

	@Input() iconType: '' | 'warning';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	// Set bg image path
	@Input() bgImage: string;

	// Set skin color, default to light
	@Input() skin: 'light' | 'dark' = 'light';

	@Input() gridNavSkin: 'light' | 'dark' = 'light';

	/**
	 * Component constructor
	 */
	constructor() {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * After view init
	 */
	ngAfterViewInit(): void {
	}

	/**
	 * On init
	 */
	ngOnInit(): void {
	}

	onSVGInserted(svg) {
		svg.classList.add('kt-svg-icon', 'kt-svg-icon--success', 'kt-svg-icon--lg');
	}
}
