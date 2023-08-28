import { IEdit } from './interfaces/edit.interface';
import { IFilter } from './interfaces/filter.interface';
import { ILog } from './interfaces/log.interface';

export class BaseModel implements IEdit, IFilter, ILog {
	// Edit
	_isEditMode = false;
	_isNew = false;
	_isUpdated = false;
	_isDeleted = false;
	_prevState: any = null;
	// Filter
	_defaultFieldName = '';
	// Log
	_userId = 0; // Admin
	_createdDate: string;
	_updatedDate: string;
	_targetPeriodType: string[];
}
