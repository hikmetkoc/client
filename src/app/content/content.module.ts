import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { TinymceComponent } from './standard/tinymce/tinymce.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PartialsModule } from '../views/partials/partials.module';
import {
	MatInputModule,
	MatPaginatorModule,
	MatProgressSpinnerModule,
	MatSortModule,
	MatTableModule,
	MatSelectModule,
	MatMenuModule,
	MatProgressBarModule,
	MatButtonModule,
	MatCheckboxModule,
	MatDialogModule,
	MatTabsModule,
	MatNativeDateModule,
	MatCardModule,
	MatRadioModule,
	MatIconModule,
	MatDatepickerModule,
	MatExpansionModule,
	MatAutocompleteModule,
	MatSnackBarModule,
	MatTooltipModule,
	MatChipsModule,
	MatButtonToggleModule,
	MatListModule,
	MatBottomSheetModule,
	MatPaginatorIntl,
	MatSidenavModule,
	MatTreeModule
} from '@angular/material';
import { GridComponent } from './_base/grid/grid.component';
import { LineItemsComponent } from './_base/lineitems/lineitems.component';
import { DetailComponent } from './_base/detail/detail.component';
import { FileManagerComponent } from './_base/detail/filemanager/filemanager.component';
import { ReportManagerComponent } from './_base/detail/reportmanager/reportmanager.component';
import { EditEntityDialogComponent } from './_base/dialogs/edit-entity-dialog/edit-entity-dialog.component';
import { FilterDialogComponent } from './_base/dialogs/filter-dialog/filter-dialog.component';
import { LayoutSaveDialogComponent } from './_base/dialogs/filter-save-dialog/filter-save-dialog.component';
import { LayoutShareDialogComponent } from './_base/dialogs/layout-share-dialog/layout-share-dialog.component';
import { DateTimePickerComponent } from './_base/dialogs/edit-entity-dialog/date-time-picker/date-time-picker.component';
import { DeleteConfirmComponent } from './_base/dialogs/delete-confirmation/delete-confirm.component';
import { SendApprovalConfirmComponent } from './_base/dialogs/sendapproval-confirm/sendapproval-confirm.component';
import { GotoApprovalConfirmComponent } from './_base/dialogs/gotoapproval-confirm/gotoapproval-confirm.component';
import { ObjectPipe, getTrPaginatorIntl } from './_base/utils';
import { HistoryComponent } from './_base/detail/history/history.component';
import { ViewHistoryComponent } from './_base/detail/viewhistory/viewhistory.component';
import { FileManagerToolComponent } from './_base/detail/filemanager/filemanagertool/filemanagertool.component';
import { FileManagerDialogComponent } from './_base/detail/filemanager/file-manager-dialog/file-manager-dialog.component';
import { ReportManagerToolComponent } from './_base/detail/reportmanager/reportmanagertool/reportmanagertool.component';
import { ReportManagerDialogComponent } from './_base/detail/reportmanager/report-manager-dialog/report-manager-dialog.component';
import { IkReportManagerDialogComponent } from './_base/detail/reportmanager/ikreport-manager-dialog/ikreport-manager-dialog.component';
import { FullTextDialogComponent } from './_base/dialogs/full-text-dialog/full-text-dialog.component';
import { BuyReportManagerDialogComponent } from './_base/detail/reportmanager/buyreport-manager-dialog/buyreport-manager-dialog.component';
import { HolidayDetailDialogComponent } from './_base/detail/reportmanager/holiday-detail-dialog/holiday-detail-dialog.component';
import { UpdateStatusDialogComponent } from './_base/dialogs/update-status-dialog/update-status-dialog.component';
import { DeleteEntityDialogComponent } from './_base/dialogs/delete-entity-dialog/delete-entity-dialog.component';
import { ActionNotificationComponent } from './_base/dialogs/action-notification/action-notification.component';
import { TextMaskModule } from 'angular2-text-mask';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TreeviewModule } from 'ngx-treeview';
import { BaseService } from './_base/base.service';
import { HttpUtilsService } from './_base/http-utils.service';
import { DialogAlertComponent } from './_base/dialogs/dialog-alert/dialog-alert.component';
import { RouterModule, Routes } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { UserComponent } from './standard/user/user.component';
import { UserAdmComponent } from './admin/user/user.component';
import { CustomerComponent } from './standard/customer/customer.component';
import { AnnouncementComponent } from './admin/announcement/announcement.component';
import { ContactInformationComponent } from './admin/contact_information/contact-information.component';
import { AttributeComponent } from './admin/attribute/attribute.component';
import { ParameterComponent } from './admin/parameter/parameter.component';
import { ProductComponent } from './admin/product/product.component';
import { QuerySchedulerComponent } from './admin/query-scheduler/query-scheduler.component';
import { RoleComponent } from './admin/role/role.component';
import { SurveyComponent } from './admin/survey/survey.component';
import { TargetComponent } from './admin/target/target.component';
import { ActivityComponent } from './standard/activity/activity.component';
import { ResponsibleComponent } from './standard/responsible/responsible.component';
import { IkfileComponent } from './standard/ikfile/ikfile.component';
import { DocumentComponent } from './standard/document/document.component';
import { CampaignComponent } from './standard/campaign/campaign.component';
import { ContactComponent } from './standard/contact/contact.component';
import { ContProductComponent } from './standard/contproduct/contproduct.component';
import { HolidayComponent } from './standard/holiday/holiday.component';
import { UserTrialFormComponent } from './standard/usertrialform/usertrialform.component';
import { UserEvaluationFormComponent} from './standard/userevaluationform/userevaluationform.component';
import { ExuseHolidayComponent } from './standard/exuseholiday/exuseholiday.component';
import { QuoteComponent } from './standard/quote/quote.component';
import { ReportComponent } from './standard/report/report.component';
import { PageHeaderComponent } from './_base/pageheader/pageheader.component';
import { ObjectTreeComponent } from './_base/objecttree/objecttree.component';
import { TopBarSearchComponent } from './_base/topbar/top-bar-search/top-bar-search.component';
import { TopBarSearchResultComponent } from './_base/topbar/search-result/top-bar-search-result.component';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {InlineSVGModule} from 'ng-inline-svg';
import { SimpleTableComponent } from './_base/simpletable/simpletable.component';
import { TeamComponent } from './admin/team/team.component';
import { WidgetModule } from './standard/dashboard/widgets/widget.module';
import { ActivityWizardComponent } from './standard/activitywizard/activitywizard.component';
import { TaskComponent } from './standard/task/task.component';
import { ProjectComponent} from './standard/project/project.component';
import { ProjTaskComponent} from './standard/projtask/projtask.component';
import { ProjOfficerComponent} from './standard/projofficer/projofficer.component';
import { ProjTaskOfficerComponent} from './standard/projtaskofficer/projtaskofficer.component';
import { ProjTaskActivityComponent} from './standard/projtaskactivity/projtaskactivity.component';
import { ProjModuleComponent} from './standard/projmodule/projmodule.component';
import { ProjModuleOfficerComponent} from './standard/projmoduleofficer/projmoduleofficer.component';
import { ProjModuleSprintComponent} from './standard/projmodulesprint/projmodulesprint.component';
import { CustomTaskComponent } from './standard/customtask/customtask.component';
import { OfferComponent } from './standard/offer/offer.component';
import { BehaviorComponent} from './standard/behavior/behavior.component';
import { MotionSumsComponent} from './standard/motionsums/motionsums.component';
import { BuyComponent } from './standard/buy/buy.component';
import { PaymentOrderComponent } from './standard/paymentorder/paymentorder.component';
import { RiskAnalysisComponent} from './standard/riskanalysis/riskanalysis.component';
import { InvoiceListComponent } from './standard/invoicelist/invoicelist.component';
import { SpendComponent } from './standard/spend/spend.component';
import { LimitComponent } from './admin/limit/limit.component';
import { FuelLimitComponent } from './standard/fuellimit/fuellimit.component';
import { MaterialComponent} from './standard/material/material.component';
import { UserAcceptanceComponent} from './standard/useracceptance/useracceptance.component';
import { FuelRiskComponent} from './standard/fuelrisk/fuelrisk.component';
import { IbanComponent } from './standard/iban/iban.component';
import { HolManagerComponent } from './admin/holmanager/holmanager.component';
import { AttrComponent} from './admin/attr/attr.component';
import { AttributeValueComponent} from './admin/attributevalue/attributevalue.component';
import { UserPermissionComponent } from './admin/userpermission/userpermisson.component';
import { VocationDayComponent } from './admin/vocationday/vocationday.component';
import { StoreComponent } from './standard/store/store.component';
import { CustomActivityComponent } from './standard/customactivity/customactivity.component';
import { MapComponent } from './standard/map/map.component';
import { TaskWizardComponent } from './standard/taskwizard/taskwizard.component';
import { ReportDialogComponent } from './_base/dialogs/report-dialog/report-dialog.component';
import { HolidayReportDialogComponent } from './_base/dialogs/holiday-report-dialog/holiday-report-dialog.component';
import { UserAcceptanceDialogComponent} from './_base/detail/reportmanager/user-acceptance-dialog/user-acceptance-dialog.component';
import { StoreDialogComponent } from './_base/dialogs/store-dialog/store-dialog.component';
import { SendSmsDialogComponent } from './_base/dialogs/send-sms-dialog/send-sms-dialog.component';
import { SendInvoiceComponent} from './_base/dialogs/send-invoice-dialog/send-invoice.component';
import { ChangeRoleComponent} from './_base/dialogs/change-role-dialog/change-role.component';
import { ChangeGroupComponent} from './_base/dialogs/change-group-dialog/change-group.component';
import { ConnectStoreDialogComponent} from './_base/dialogs/connect-store-dialog/connect-store-dialog.component';
import { SpendOkeyComponent} from './_base/dialogs/spend-okey-dialog/spend-okey.component';
import { ResignComponent} from './_base/dialogs/resign-dialog/resign.component';
import { PaymentOkeyComponent} from './_base/dialogs/payment-okey-dialog/payment-okey.component';
import { LoadInvoiceComponent} from './_base/dialogs/load-invoice-dialog/load-invoice.component';
import { SendSpendComponent} from './_base/dialogs/send-spend-dialog/send-spend.component';
import { SpendToTlComponent} from './_base/dialogs/spend-to-tl-dialog/spend-to-tl.component';
import { PaymentOrderFileDialogComponent} from './_base/dialogs/payment-order-file-dialog/payment-order-file-dialog.component';
import { Base64FileDialogComponent} from './_base/dialogs/base64-file-dialog/base64-file-dialog.component';
import { ShowFuelLimitRiskDialogComponent} from './_base/dialogs/show-fuel-limit-risk-dialog/show-fuel-limit-risk-dialog.component';
import { FuelLimitOkeyComponent} from './_base/dialogs/fuel-limit-okey-dialog/fuel-limit-okey.component';
import { ShowResignComponent} from './_base/detail/show-resign-dialog/show-resign.component';
import { ShowPersonelContractComponent} from './_base/detail/show-personel-contract-dialog/show-personel-contract.component';
import { NewPersonComponent} from './_base/dialogs/new-person-dialog/new-person.component';
import { AddIbanComponent} from './_base/dialogs/add-iban-dialog/add-iban.component';
import { AreYouOkeyComponent} from './_base/dialogs/are-you-okey-dialog/are-you-okey.component';
import { ShowInvoiceComponent} from './_base/dialogs/show-invoice-dialog/show-invoice.component';
import { PaymentOrderInfoDialogComponent} from './_base/dialogs/payment-order-info-dialog/payment-order-info-dialog.component';
import { LookInfoDialogComponent} from './_base/dialogs/look-info-dialog/look-info-dialog.component';
import { SpendInfoDialogComponent} from './_base/dialogs/spend-info-dialog/spend-info-dialog.component';
import { ContinueConfirmComponent } from './_base/dialogs/continue-confirm/continue-confirm.component';
import { LeadComponent } from './standard/lead/lead.component';
import { UserGuideComponent } from './standard/user-guide/user-guide.component';
import {ShowChangeDbsInvoiceComponent} from './_base/detail/show-change-dbs-invoice-dialog/show-change-dbs-invoice.component';
import {ChangePasswordDialogComponent} from './_base/dialogs/change-password-dialog/change-password-dialog.component';
import {AddSpendComponent} from './_base/dialogs/add-spend-dialog/add-spend.component';
import {GridOkeyComponent} from './_base/dialogs/grid-okey-dialog/grid-okey.component';
import {
	UserTrialFormDialogComponent
} from './_base/detail/reportmanager/user-trial-form-dialog/user-trial-form-dialog.component';
import {
	UserEvaluationFormDialogComponent
} from './_base/detail/reportmanager/user-evaluation-form-dialog/user-evaluation-form-dialog.component';



const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{
		path: 'dashboard',
		loadChildren: () => import('./standard/dashboard/dashboard.module').then(m => m.DashboardModule)
	},
	{
		path: 'product',
		component: ProductComponent
	},
	{
		path: 'target',
		component: TargetComponent
	},
	{
		path: 'survey',
		component: SurveyComponent
	},
	{
		path: 'announcement',
		component: AnnouncementComponent
	},
	{
		path: 'contact-information',
		component: ContactInformationComponent
	},
	{
		path: 'user',
		component: UserComponent
	},
	{
		path: 'user',
		component: UserAdmComponent
	},
	{
		path: 'role',
		component: RoleComponent
	},
	{
		path: 'attribute',
		component: AttributeComponent
	},
	{
		path: 'parameter',
		component: ParameterComponent
	},
	{
		path: 'queryscheduler',
		component: QuerySchedulerComponent
	},
	{
		path: 'customer',
		component: CustomerComponent
	},
	{
		path: 'task',
		component: TaskComponent
	},
	{
		path: 'project',
		component: ProjectComponent
	},
	{
		path: 'projtask',
		component: ProjTaskComponent
	},
	{
		path: 'projmodule',
		component: ProjModuleComponent
	},
	{
		path: 'projofficer',
		component: ProjOfficerComponent
	},
	{
		path: 'projtaskofficer',
		component: ProjTaskOfficerComponent
	},
	{
		path: 'projtaskactivity',
		component: ProjTaskActivityComponent
	},
	{
		path: 'projmoduleofficer',
		component: ProjModuleOfficerComponent
	},
	{
		path: 'projmodulesprint',
		component: ProjModuleSprintComponent
	},
	{
		path: 'buy',
		component: BuyComponent
	},
	{
		path: 'paymentorder',
		component: PaymentOrderComponent
	},
	{
		path: 'riskanalysis',
		component: RiskAnalysisComponent
	},
	{
		path: 'invoicelist',
		component: InvoiceListComponent
	},
	{
		path: 'limit',
		component: LimitComponent
	},
	{
		path: 'fuellimit',
		component: FuelLimitComponent
	},
	{
		path: 'material',
		component: MaterialComponent
	},
	{
		path: 'useracceptance',
		component: UserAcceptanceComponent
	},
	{
		path: 'fuelrisk',
		component: FuelRiskComponent
	},
	{
		path: 'iban',
		component: IbanComponent
	},
	{
		path: 'holmanager',
		component: HolManagerComponent
	},
	{
		path: 'attr',
		component: AttrComponent
	},
	{
		path: 'attributevalue',
		component: AttributeValueComponent
	},
	{
		path: 'userpermission',
		component: UserPermissionComponent
	},
	{
		path: 'vocationday',
		component: VocationDayComponent
	},
	{
		path: 'store',
		component: StoreComponent
	},
	{
		path: 'customtask',
		component: CustomTaskComponent
	},
	{
		path: 'offer',
		component: OfferComponent
	},
	{
		path: 'behavior',
		component: BehaviorComponent
	},
	{
		path: 'motionsums',
		component: MotionSumsComponent
	},
	{
		path: 'customactivity',
		component: CustomActivityComponent
	},
	{
		path: 'spend',
		component: SpendComponent
	},
	{
		path: 'ikfile',
		component: IkfileComponent
	},
	{
		path: 'document',
		component: DocumentComponent
	},
	{
		path: 'contact',
		component: ContactComponent
	},
	{
		path: 'activity',
		component: ActivityComponent
	},
	{
		path: 'responsible',
		component: ResponsibleComponent
	},
	{
		path: 'quote',
		component: QuoteComponent
	},
	{
		path: 'contproduct',
		component: ContProductComponent
	},
	{
		path: 'holiday',
		component: HolidayComponent
	},
	{
		path: 'usertrialform',
		component: UserTrialFormComponent
	},
	{
		path: 'userevaluationform',
		component: UserEvaluationFormComponent
	},
	{
		path: 'exuseholiday',
		component: ExuseHolidayComponent
	},
	{
		path: 'campaign',
		component: CampaignComponent
	},
	{
		path: 'report',
		component: ReportComponent
	},
	{
		path: 'team',
		component: TeamComponent
	},
	{
		path: 'activity/wizard',
		component: ActivityWizardComponent
	},
	{
		path: 'customer/map',
		component: MapComponent
	},
	{
		path: 'task/wizard',
		component: TaskWizardComponent
	},
	{
		path: 'lead',
		component: LeadComponent
	},
	{
		path: 'user-guide',
		component: UserGuideComponent
	}
];

@NgModule({
	declarations: [
		GridComponent,
		LineItemsComponent,
		DetailComponent,
		FileManagerComponent,
		ReportManagerComponent,
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		ChangePasswordDialogComponent,
		UpdateStatusDialogComponent,
		EditEntityDialogComponent,
		FilterDialogComponent,
		LayoutSaveDialogComponent,
		LayoutShareDialogComponent,
		DateTimePickerComponent,
		DeleteConfirmComponent,
		SendApprovalConfirmComponent,
		GotoApprovalConfirmComponent,
		ObjectPipe,
		HistoryComponent,
		ViewHistoryComponent,
		FileManagerToolComponent,
		FileManagerDialogComponent,
		ReportManagerToolComponent,
		ReportManagerDialogComponent,
		IkReportManagerDialogComponent,
		BuyReportManagerDialogComponent,
		FullTextDialogComponent,
		HolidayDetailDialogComponent,
		ExuseHolidayComponent,
		UserTrialFormComponent,
		UserEvaluationFormComponent,
		AnnouncementComponent,
		ContactInformationComponent,
		AttributeComponent,
		ParameterComponent,
		ProductComponent,
		QuerySchedulerComponent,
		RoleComponent,
		SurveyComponent,
		TargetComponent,
		DialogAlertComponent,
		UserComponent,
		UserAdmComponent,
		TaskComponent,
		ProjectComponent,
		ProjTaskComponent,
		ProjModuleComponent,
		ProjOfficerComponent,
		ProjTaskOfficerComponent,
		ProjTaskActivityComponent,
		ProjModuleOfficerComponent,
		ProjModuleSprintComponent,
		TinymceComponent,
		CustomTaskComponent,
		OfferComponent,
		BehaviorComponent,
		MotionSumsComponent,
		BuyComponent,
		PaymentOrderComponent,
		RiskAnalysisComponent,
		InvoiceListComponent,
		LimitComponent,
		FuelLimitComponent,
		MaterialComponent,
		UserAcceptanceComponent,
		FuelRiskComponent,
		IbanComponent,
		HolManagerComponent,
		AttrComponent,
		AttributeValueComponent,
		UserPermissionComponent,
		VocationDayComponent,
		StoreComponent,
		CustomActivityComponent,
		SpendComponent,
		ActivityComponent,
		ResponsibleComponent,
		IkfileComponent,
		DocumentComponent,
		CampaignComponent,
		ContactComponent,
		ContProductComponent,
		HolidayComponent,
		CustomerComponent,
		QuoteComponent,
		ReportComponent,
		PageHeaderComponent,
		ObjectTreeComponent,
		SimpleTableComponent,
		TopBarSearchComponent,
		TopBarSearchResultComponent,
		TeamComponent,
		ActivityWizardComponent,
		MapComponent,
		TaskWizardComponent,
		ReportDialogComponent,
		HolidayReportDialogComponent,
		UserAcceptanceDialogComponent,
		UserTrialFormDialogComponent,
		UserEvaluationFormDialogComponent,
		StoreDialogComponent,
		SendSmsDialogComponent,
		SendInvoiceComponent,
		ChangeGroupComponent,
		ChangeRoleComponent,
		ConnectStoreDialogComponent,
		SpendOkeyComponent,
		ResignComponent,
		NewPersonComponent,
		AddIbanComponent,
		AddSpendComponent,
		AreYouOkeyComponent,
		PaymentOkeyComponent,
		GridOkeyComponent,
		LoadInvoiceComponent,
		SendSpendComponent,
		SpendToTlComponent,
		PaymentOrderFileDialogComponent,
		Base64FileDialogComponent,
		ShowFuelLimitRiskDialogComponent,
		FuelLimitOkeyComponent,
		ShowInvoiceComponent,
		ShowResignComponent,
		ShowPersonelContractComponent,
		ShowChangeDbsInvoiceComponent,
		PaymentOrderInfoDialogComponent,
		LookInfoDialogComponent,
		SpendInfoDialogComponent,
		ContinueConfirmComponent,
		LeadComponent,
		UserGuideComponent
	],
	entryComponents: [
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		ChangePasswordDialogComponent,
		UpdateStatusDialogComponent,
		EditEntityDialogComponent,
		FilterDialogComponent,
		LayoutSaveDialogComponent,
		LayoutShareDialogComponent,
		DeleteConfirmComponent,
		SendApprovalConfirmComponent,
		GotoApprovalConfirmComponent,
		FileManagerDialogComponent,
		ReportManagerDialogComponent,
		IkReportManagerDialogComponent,
		BuyReportManagerDialogComponent,
		FullTextDialogComponent,
		HolidayDetailDialogComponent,
		ReportDialogComponent,
		HolidayReportDialogComponent,
		UserAcceptanceDialogComponent,
		UserTrialFormDialogComponent,
		UserEvaluationFormDialogComponent,
		StoreDialogComponent,
		SendSmsDialogComponent,
		SendInvoiceComponent,
		ChangeRoleComponent,
		ChangeGroupComponent,
		ConnectStoreDialogComponent,
		SpendOkeyComponent,
		ResignComponent,
		NewPersonComponent,
		AddIbanComponent,
		AddSpendComponent,
		AreYouOkeyComponent,
		PaymentOkeyComponent,
		GridOkeyComponent,
		LoadInvoiceComponent,
		SendSpendComponent,
		SpendToTlComponent,
		PaymentOrderFileDialogComponent,
		Base64FileDialogComponent,
		ShowFuelLimitRiskDialogComponent,
		FuelLimitOkeyComponent,
		ShowInvoiceComponent,
		ShowResignComponent,
		ShowPersonelContractComponent,
		ShowChangeDbsInvoiceComponent,
		PaymentOrderInfoDialogComponent,
		LookInfoDialogComponent,
		SpendInfoDialogComponent,
		ContinueConfirmComponent
	],
	exports: [
		TopBarSearchComponent,
		TinymceComponent,
		GridComponent,
		InvoiceListComponent
	],
	imports: [
		CommonModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		PartialsModule,
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
		MatInputModule,
		MatTableModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatIconModule,
		MatNativeDateModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatCardModule,
		MatPaginatorModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatExpansionModule,
		MatTabsModule,
		MatTooltipModule,
		MatDialogModule,
		MatChipsModule,
		MatButtonToggleModule,
		MatBottomSheetModule,
		MatListModule,
		MatSidenavModule,
		MatTreeModule,
		TextMaskModule,
		NgbModule,
		LeafletModule.forRoot(),
		TreeviewModule.forRoot(),
		RouterModule.forChild(routes),
		FullCalendarModule,
		PerfectScrollbarModule,
		InlineSVGModule,
		WidgetModule,
	],
	providers: [
		BaseService,
		HttpUtilsService,
		{ provide: MatPaginatorIntl, useValue: getTrPaginatorIntl() }
	]
})
export class ContentModule {
}
