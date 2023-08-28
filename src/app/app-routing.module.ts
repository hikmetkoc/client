// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{ path: 'auth', loadChildren: () => import('app/views/pages/auth/auth.module').then(m => m.AuthModule) },

	// enable this router to set which demo theme to load,
	// leave the path value empty to enter into nested router in ThemeModule
	{ path: '', loadChildren: 'app/views/themes/demo8/theme.module#ThemeModule' },

	{ path: '**', redirectTo: 'demo8/error/403', pathMatch: 'full' },
	// {path: '**', redirectTo: 'error/403', pathMatch: 'full'},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})
	],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
