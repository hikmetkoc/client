// Angular
import { Component } from '@angular/core';
import { Utils } from '../../../../../content/_base/utils';

@Component({
	selector: 'kt-topbar',
	templateUrl: './topbar.component.html',
	styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
	utils = Utils;
}
