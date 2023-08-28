import { Filter } from './filter';

export class QueryParamsModel {
	// fields
	filters: Filter[];
	page: number;
	size: number;
	columns: any[];
	fileType: string;
	sorts: { sortOrder: string; sortBy: string; }[];
	search: string;
	owner: 'ALL' | 'HIERARCHY_D' = 'ALL';
	assigner: 'ALL' | 'HIERARCHY_D' = 'ALL';
	other: 'ALL' | 'HIERARCHY_D' = 'ALL';
	filter: any;

	// constructor overrides
	constructor(
		_filter?,
		_sort = [{ sortOrder: 'DESC', sortBy: 'createdDate' }],
		_pageNumber = 0,
		_pageSize = 10,
		_columns?,
		_fileType?
	) {
		this.filter = _filter;
		this.sorts = _sort;
		this.page = _pageNumber;
		this.size = _pageSize;
		this.columns = _columns;
		this.fileType = _fileType;
		this.search = '';
		this.owner = 'ALL';
		this.assigner = 'ALL';
		this.other = 'ALL';
	}
}
