import { Injectable } from '@angular/core';
import { HttpParams, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';
import { QueryParamsModel } from './models/query-params.model';
import { QueryResultsModel } from './models/query-results.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpUtilsService {

	getFindHTTPParams(queryParams): HttpParams {
		const params = new HttpParams()
			.set('lastNamefilter', queryParams.filter)
			.set('sort', queryParams.sort)
			.set('pageNumber', queryParams.pageNumber.toString())
			.set('pageSize', queryParams.pageSize.toString());

		return params;
	}

	getHTTPHeaders(): HttpHeaders {
		let headers = new HttpHeaders();
		const token = localStorage.getItem(environment.authTokenKey);
		headers = headers.append('Content-Type', 'application/json');
		if (token !== undefined) {
			headers = headers.append('Authorization', 'Bearer ' + token);
		}
		// headers = headers.append('Accept', 'application/pdf, application/vnd.ms-excel');
		return headers;
	}

	baseFilter(_entities: any[], _queryParams: QueryParamsModel, _filtrationFields: string[] = []): QueryResultsModel {
		// Filtration
		let entitiesResult = this.searchInArray(_entities, _queryParams.filters, _filtrationFields);

		// Sorting
		// start
		if (_queryParams.sorts && _queryParams.sorts.length > 0 && _queryParams.sorts[0].sortBy) {
			entitiesResult = this.sortArray(entitiesResult, _queryParams.sorts[0].sortBy, _queryParams.sorts[0].sortOrder);
		}
		// end

		// Paginator
		// start
		const totalCount = entitiesResult.length;
		const initialPos = _queryParams.page * _queryParams.size;
		entitiesResult = entitiesResult.slice(initialPos, initialPos + _queryParams.page);
		// end

		const queryResults = new QueryResultsModel();
		queryResults.result = entitiesResult;
		queryResults.totalCount = totalCount;
		return queryResults;
	}

	sortArray(_incomingArray: any[], _sortBy: string = '', _sortOrder: string = 'ASC'): any[] {
		if (!_sortBy) {
			return _incomingArray;
		}

		let result: any[] = [];
		result = _incomingArray.sort((a, b) => {
			if (a[_sortBy] < b[_sortBy]) {
				return _sortOrder === 'ASC' ? -1 : 1;
			}

			if (a[_sortBy] > b[_sortBy]) {
				return _sortOrder === 'ASC' ? 1 : -1;
			}

			return 0;
		});
		return result;
	}

	searchInArray(_incomingArray: any[], _queryObj: any, _filtrationFields: string[] = []): any[] {
		const result: any[] = [];
		let resultBuffer: any[] = [];
		const indexes: number[] = [];
		let firstIndexes: number[] = [];
		let doSearch = false;

		_filtrationFields.forEach(item => {
			if (item in _queryObj) {
				_incomingArray.forEach((element, index) => {
					if (element[item] === _queryObj[item]) {
						firstIndexes.push(index);
					}
				});
				firstIndexes.forEach(element => {
					resultBuffer.push(_incomingArray[element]);
				});
				_incomingArray = resultBuffer.slice(0);
				resultBuffer = [].slice(0);
				firstIndexes = [].slice(0);
			}
		});

		Object.keys(_queryObj).forEach(key => {
			const searchText = _queryObj[key].toString().trim().toLowerCase();
			if (key && !_.includes(_filtrationFields, key) && searchText) {
				doSearch = true;
				try {
					_incomingArray.forEach((element, index) => {
						const _val = element[key].toString().trim().toLowerCase();
						if (_val.indexOf(searchText) > -1 && indexes.indexOf(index) === -1) {
							indexes.push(index);
						}
					});
				} catch (ex) {
					console.error(ex, key, searchText);
				}
			}
		});

		if (!doSearch) {
			return _incomingArray;
		}

		indexes.forEach(re => {
			result.push(_incomingArray[re]);
		});

		return result;
	}
}
