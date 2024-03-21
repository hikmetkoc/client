// Angular
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
// RxJS
import { filter, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { defer, Observable, of } from 'rxjs';
// NGRX
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
// Auth actions
import { AuthActionTypes, Login, Logout, Register, UserLoaded, UserRequested } from '../_actions/auth.actions';
import { AuthService } from '../_services/index';
import { AppState } from '../../reducers';
import { environment } from '../../../../environments/environment';
import { isUserLoaded } from '../_selectors/auth.selectors';
import { MenuAsideService } from '../../_base/layout/services/menu-aside.service';
import { Utils } from '../../../content/_base/utils';

@Injectable()
export class AuthEffects {
    @Effect({ dispatch: false })
    login$ = this.actions$.pipe(
        ofType<Login>(AuthActionTypes.Login),
        tap(action => {
            localStorage.setItem(environment.authTokenKey, action.payload.authToken);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('metadata', JSON.stringify(action.payload.metadata));
            localStorage.setItem('attributeValues', JSON.stringify(action.payload.attributeValues));
            localStorage.setItem('operations', JSON.stringify(action.payload.operations ? action.payload.operations : []));
            localStorage.setItem('permissions', JSON.stringify(action.payload.permissions));
			         localStorage.setItem('userPermissions', JSON.stringify(action.payload.userPermissions));
            localStorage.setItem('configurations', JSON.stringify(action.payload.configurations));
            localStorage.setItem('backendVersion', JSON.stringify(action.payload.backendVersion));
            this.menuAsideService.loadMenu();
            this.store.dispatch(new UserRequested());
        }),
    );

    @Effect({ dispatch: false })
    logout$ = this.actions$.pipe(
        ofType<Logout>(AuthActionTypes.Logout),
        tap(() => {
            localStorage.removeItem(environment.authTokenKey);
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.returnUrl } });
        })
    );

    @Effect({ dispatch: false })
    register$ = this.actions$.pipe(
        ofType<Register>(AuthActionTypes.Register),
        tap(action => {
            localStorage.setItem(environment.authTokenKey, action.payload.authToken);
        })
    );

    @Effect({ dispatch: false })
    loadUser$ = this.actions$
        .pipe(
            ofType<UserRequested>(AuthActionTypes.UserRequested),
            withLatestFrom(this.store.pipe(select(isUserLoaded))),
            filter(([, _isUserLoaded]) => !_isUserLoaded),
            mergeMap(([, _isUserLoaded]) => this.auth.getUserByToken()),
            tap(_user => {
                if (_user) {
                    this.store.dispatch(new UserLoaded({ user: _user }));
                } else {
                    this.store.dispatch(new Logout());
                }
            })
        );

    @Effect()
    init$: Observable<Action> = defer(() => {
        const userToken = localStorage.getItem(environment.authTokenKey);
        const user = JSON.parse(localStorage.getItem('user'));
        const metadata = JSON.parse(localStorage.getItem('metadata'));
        const attributeValues = JSON.parse(localStorage.getItem('attributeValues'));
        const operations = JSON.parse(localStorage.getItem('operations'));
        const permissions = JSON.parse(localStorage.getItem('permissions'));
		      const userPermissions = JSON.parse(localStorage.getItem('userPermissions'));
        const configurations = JSON.parse(localStorage.getItem('configurations'));
        const backendVersion = JSON.parse(localStorage.getItem('backendVersion'));
        let observableResult = of({ type: 'NO_ACTION' });
        if (userToken) {
            observableResult = of(new Login({ authToken: userToken, user, metadata, attributeValues, operations, permissions, userPermissions, configurations, backendVersion }));
        }
        return observableResult;
    });

    private returnUrl: string;

    constructor(
        private actions$: Actions,
        private router: Router,
        private auth: AuthService,
        private store: Store<AppState>,
        public menuAsideService: MenuAsideService,) {

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.returnUrl = event.url;
            }
        });
    }
}
