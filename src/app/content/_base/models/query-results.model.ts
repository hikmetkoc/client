export class QueryResultsModel {
	// fields
	result: any[];
	totalCount: number;
	error: string;
	headers: any;
	body: any;

	constructor(_items: any[] = [], _errorMessage: string = '') {
		this.result = _items;
		this.totalCount = _items.length;
		this.error = _errorMessage;
		this.headers = null;
	}
}
