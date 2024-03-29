import { Utils } from '../utils';

export enum FilterOperation {
    EQUALS = 'EQUALS',
    CONTAINS = 'CONTAINS',
    STARTS_WITH = 'STARTS_WITH',
    ENDS_WITH = 'ENDS_WITH',
    GREATER_THAN = 'GREATER_THAN',
    GREATER_OR_EQUAL_THAN = 'GREATER_OR_EQUAL_THAN',
    LESS_THAN = 'LESS_THAN',
    LESS_OR_EQUAL_THAN = 'LESS_OR_EQUAL_THAN',
    BETWEEN = 'BETWEEN',
    IN = 'IN',
    SPECIFIED = 'SPECIFIED',
	NOT_IN = 'NOT_IN'
}
export class Filter {
    filterList = [];
    operator = 'AND_GROUP';

    constructor(
        _fieldName: string = '',
        _value: any = '',
        _operation = FilterOperation.EQUALS
    ) {
        const filter = Utils.makeFilter([{
            name: _fieldName,
            operator: _operation,
            value: _value
        }]);
        this.filterList = filter.filterList;
    }
}
