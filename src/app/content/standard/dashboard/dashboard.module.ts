// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// Core Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../../views/partials/partials.module';
import { DashboardComponent } from './dashboard.component';
import { WidgetModule } from './widgets/widget.module';
import { MatButtonModule, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule, MatSortModule, MatTableModule, MatFormFieldModule, MatSelectModule, MatTooltipModule, } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		CoreModule,
		RouterModule.forChild([
			{
				path: '',
				component: DashboardComponent
			},
		]),
		WidgetModule,
		MatTableModule,
		MatIconModule,
		MatButtonModule,
		MatTooltipModule,
		MatProgressSpinnerModule,
		MatPaginatorModule,
		MatSortModule,
		MatFormFieldModule,
		MatSelectModule,
		FormsModule,
		ReactiveFormsModule
	],
	providers: [],
	declarations: [
		DashboardComponent,
	]
})
export class DashboardModule {
}
