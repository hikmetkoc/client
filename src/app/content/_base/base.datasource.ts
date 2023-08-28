import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { BaseModel } from './base.model';
import * as _ from 'lodash';
import { catchError, tap } from 'rxjs/operators';
import { BaseService } from './base.service';
import { QueryResultsModel } from './models/query-results.model';
import { QueryParamsModel } from './models/query-params.model';

export class BaseDataSource implements DataSource<BaseModel> {
	entitySubject = new BehaviorSubject<any[]>([]);
	hasItems = false;
	loading$: Observable<boolean>;

	paginatorTotalSubject = new BehaviorSubject<number>(0);
	paginatorTotal$: Observable<number>;

	url: string;

	constructor(
		public baseService: BaseService
	) {
		this.loading$ = this.baseService.loadingSubject.asObservable();
		this.paginatorTotal$ = this.paginatorTotalSubject.asObservable();
		this.paginatorTotal$.subscribe(res => this.hasItems = res > 0);
	}

	loadAfter(
		queryParams: QueryParamsModel,
		subList?: string | number
	) {
		const _self = this;
		const call = this.baseService.find(queryParams, this.url).pipe(
			tap(res => {
				this.entitySubject.next(subList ? res.body[0][subList] : res.body);
				this.paginatorTotalSubject.next(res.headers.get('x-total-count'));
			}),
			catchError(err => {
				this.baseService.loadingSubject.next(false);
				const result = of(new QueryResultsModel([], err));
				if (err.status === 401) {
					_self.baseService.logout();
				}
				return result;
			})
		);
		return call;
	}

	load(
		queryParams: QueryParamsModel,
		subList?: undefined
	) {
		this.loadAfter(queryParams, subList).subscribe();
	}

	connect(collectionViewer: CollectionViewer): Observable<any[]> {
		return this.entitySubject.asObservable();
	}

	disconnect(collectionViewer: CollectionViewer): void {
		this.entitySubject.complete();
		// this.baseService.loadingSubject.complete(); // açınca çift tıklamaya izin vererek mükerrer kayıt yaratıyor
		this.paginatorTotalSubject.complete();
	}

	baseFilter(_entities: any[], _queryParams: QueryParamsModel, _filtrationFields: string[] = []): QueryResultsModel {
		let entitiesResult = this.searchInArray(_entities, _queryParams.filters, _filtrationFields);

		if (_queryParams.sorts && _queryParams.sorts.length > 0 && _queryParams.sorts[0].sortBy) {
			entitiesResult = this.sortArray(entitiesResult, _queryParams.sorts[0].sortBy, _queryParams.sorts[0].sortOrder);
		}
		const totalCount = entitiesResult.length;
		const initialPos = _queryParams.page * _queryParams.size;
		entitiesResult = entitiesResult.slice(initialPos, initialPos + _queryParams.size);

		const queryResults = new QueryResultsModel();
		queryResults.result = entitiesResult;
		queryResults.totalCount = totalCount;
		return queryResults;
	}

	sortArray(_incomingArray: any[], _sortField: string = '', _sortOrder: string = 'ASC'): any[] {
		if (!_sortField) {
			return _incomingArray;
		}

		let result: any[] = [];
		result = _incomingArray.sort((a, b) => {
			if (a[_sortField] < b[_sortField]) {
				return _sortOrder === 'ASC' ? -1 : 1;
			}

			if (a[_sortField] > b[_sortField]) {
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
