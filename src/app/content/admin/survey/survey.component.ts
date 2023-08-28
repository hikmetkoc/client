import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from '../../_base/base.service';
import { BaseComponent } from '../../_base/base.component';
import { Utils } from '../../_base/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
	selector: 'kt-survey',
	templateUrl: './survey.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class SurveyComponent extends BaseComponent implements OnInit, AfterViewInit {

	defaultFilter = [];
	defaultValues = [];

	constructor(
		public baseService: BaseService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public translate: TranslateService,
		public route: ActivatedRoute,
		public router: Router,
		public breakpointObserver: BreakpointObserver,
	) {
		super(baseService, dialog, snackBar, translate, route, router, breakpointObserver);

		this.model = Utils.getModel('SurveyQuestion');
	}

	ngOnInit() {
		this.init();
	}

	ngAfterViewInit() {
		this.afterViewInit();

		this.evaluateButtons();
	}

	evaluateButtons() {
		this.buttons = [];

		this.buttons.push({
			display: this.baseService.getPermissionRule(this.model.name, 'update'),
			title: 'Yeni Anket Sorusu',
			icon: 'add_box',
			click: this.mainGrid.add.bind(this.mainGrid)
		});
	}

	rowClicked(row, reload?) {
		if (reload) {
			this.reloadCurrent(row.id);
		} else {
			this.defaultFilter = [{
				name: 'surveyQuestion.id',
				operator: 'EQUALS',
				value: row.id
			}];
			this.defaultValues = [{
				field: 'surveyQuestionId',
				value: row.id
			}, {
				field: 'surveyQuestion',
				value: row
			}];
			this.current = row;
		}
	}
}
