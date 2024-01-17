import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../_models/user.model';
import { Permission } from '../_models/permission.model';
import { Role } from '../_models/role.model';
import { catchError, map } from 'rxjs/operators';
import { QueryParamsModel, QueryResultsModel } from '../../_base/crud';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

const API_USERS_URL = 'api/users';
const API_PERMISSION_URL = 'api/permissions';
const API_ROLES_URL = 'api/roles';

@Injectable()
export class AuthService {
    constructor(private http: HttpClient) { }
    // Authentication/Authorization
    login(email: string, password: string): Observable<any> {
        return this.http.post<any>('api/authenticate', { username: email, password }, { observe: 'response' as 'body' });
    }

    getUserByToken(): Observable<any> {
        // const userToken = localStorage.getItem(environment.authTokenKey);
        // let httpHeaders = new HttpHeaders();
        // httpHeaders = httpHeaders.set('Authorization', 'Bearer ' + userToken);
        // return this.http.get<any>('api/users', { headers: httpHeaders });
        return of(JSON.parse(localStorage.getItem('user')));
    }

    register(user: User): Observable<any> {
        let httpHeaders = new HttpHeaders();
        httpHeaders = httpHeaders.set('Content-Type', 'application/json');
        return this.http.post<User>(API_USERS_URL, user, { headers: httpHeaders })
            .pipe(
                map((res: User) => {
                    return res;
                }),
                catchError(err => {
                    return null;
                })
            );
    }

    public requestPassword(email: string): Observable<any> {
        return this.http.get(API_USERS_URL + '/forgot?email=' + email)
            .pipe(catchError(this.handleError('forgot-password', []))
            );
    }


    getAllUsers(): Observable<any> {
        const userToken = localStorage.getItem(environment.authTokenKey);
        let httpHeaders = new HttpHeaders();
        httpHeaders = httpHeaders.set('Authorization', 'Bearer ' + userToken);
        return this.http.get(API_USERS_URL, { headers: httpHeaders, observe: 'response' });
    }

    getUserById(userId: number): Observable<User> {
        return this.http.get<User>(API_USERS_URL + `/${userId}`);
    }

    deleteUser(userId: number) {
        const url = `${API_USERS_URL}/${userId}`;
        return this.http.delete(url);
    }

    updateUser(_user: User): Observable<any> {
        let httpHeaders = new HttpHeaders();
        httpHeaders = httpHeaders.set('Content-Type', 'application/json');
        return this.http.put(API_USERS_URL, _user, { headers: httpHeaders });
    }

    createUser(user: User): Observable<User> {
        let httpHeaders = new HttpHeaders();
        httpHeaders = httpHeaders.set('Content-Type', 'application/json');
        return this.http.post<User>(API_USERS_URL, user, { headers: httpHeaders });
    }

    findUsers(queryParams: QueryParamsModel): Observable<any> {
        let httpHeaders = new HttpHeaders();
        httpHeaders = httpHeaders.set('Content-Type', 'application/json');
        return this.http.post(API_USERS_URL, queryParams, { headers: httpHeaders, observe: 'response' });
    }

    getAllPermissions(): Observable<Permission[]> {
        return this.http.get<Permission[]>(API_PERMISSION_URL);
    }

    getRolePermissions(roleId: number): Observable<Permission[]> {
        return this.http.get<Permission[]>(API_PERMISSION_URL + '/getRolePermission?=' + roleId);
    }

    getAllRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(API_ROLES_URL);
    }

    getRoleById(roleId: number): Observable<Role> {
        return this.http.get<Role>(API_ROLES_URL + `/${roleId}`);
    }

    createRole(role: Role): Observable<Role> {
        let httpHeaders = new HttpHeaders();
        httpHeaders = httpHeaders.set('Content-Type', 'application/json');
        return this.http.post<Role>(API_ROLES_URL, role, { headers: httpHeaders });
    }

    updateRole(role: Role): Observable<any> {
        let httpHeaders = new HttpHeaders();
        httpHeaders = httpHeaders.set('Content-Type', 'application/json');
        return this.http.put(API_ROLES_URL, role, { headers: httpHeaders });
    }

    deleteRole(roleId: number): Observable<Role> {
        const url = `${API_ROLES_URL}/${roleId}`;
        return this.http.delete<Role>(url);
    }

    isRoleAssignedToUsers(roleId: number): Observable<boolean> {
        return this.http.get<boolean>(API_ROLES_URL + '/checkIsRollAssignedToUser?roleId=' + roleId);
    }

    findRoles(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
        let httpHeaders = new HttpHeaders();
        httpHeaders = httpHeaders.set('Content-Type', 'application/json');
        return this.http.post<QueryResultsModel>(API_ROLES_URL + '/findRoles', queryParams, { headers: httpHeaders });
    }

    private handleError<T>(operation = 'operation', result?: any) {
        return (error: any): Observable<any> => {
            console.error(error);

            return of(result);
        };
    }
}
