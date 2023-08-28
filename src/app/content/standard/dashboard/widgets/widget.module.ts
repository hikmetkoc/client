import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule, MatSortModule, MatTableModule, } from '@angular/material';
import { CoreModule } from '../../../../core/core.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// Datatable
import { DataTableComponent } from './general/data-table/data-table.component';
// General widgets
import { TargetWidgetComponent } from './target-widget/target-widget.component';
import { Widget5Component } from './widget5/widget5.component';
import { SalesWidgetComponent } from './sales-widget/sales-widget.component';
import { ActivityWidgetComponent } from './activity-widget/activity-widget.component';
import { Widget26Component } from './widget26/widget26.component';
import { Widget142Component } from './widget142/widget142.component';
import { AnnouncementWidgetComponent } from './announcement-widget/announcement-widget.component';
import { TaskWidgetComponent } from './task-widget/task-widget.component';
import { TargetGraphWidgetComponent } from './target-graph-widget/target-graph-widget.component';
import {ContactsWidgetComponent} from './contacts-widget/contacts-widget.component';
import {TaskStatusWidgetComponent} from './taskstatus-widget/taskstatus-widget.component';
import {BirthdayWidgetComponent} from "./birthday-widget/birthday-widget.component";

@NgModule({
	declarations: [
		DataTableComponent,
		// Widgets
		TargetWidgetComponent,
		TargetGraphWidgetComponent,
		AnnouncementWidgetComponent,
		Widget5Component,
		SalesWidgetComponent,
		ActivityWidgetComponent,
		Widget142Component,
		Widget26Component,
		TaskWidgetComponent,
		ContactsWidgetComponent,
		BirthdayWidgetComponent,
		TaskStatusWidgetComponent,
	],
	exports: [
		DataTableComponent,
		// Widgets
		TargetWidgetComponent,
		TargetGraphWidgetComponent,
		AnnouncementWidgetComponent,
		Widget5Component,
		SalesWidgetComponent,
		ActivityWidgetComponent,
		Widget142Component,
		Widget26Component,
		TaskWidgetComponent,
		ContactsWidgetComponent,
		BirthdayWidgetComponent,
		TaskStatusWidgetComponent,
	],
	imports: [
		CommonModule,
		PerfectScrollbarModule,
		MatTableModule,
		CoreModule,
		MatIconModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		MatPaginatorModule,
		MatSortModule,
	]
})
export class WidgetModule {
}
