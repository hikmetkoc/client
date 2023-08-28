import { Injectable } from '@angular/core';
import { TreeviewItem, TreeviewSelection, TreeviewI18n } from 'ngx-treeview';

@Injectable()
export class DefaultTreeviewI18n extends TreeviewI18n {
    constructor(
    ) {
        super();
    }

    getText(selection: TreeviewSelection): string {

        if (selection.uncheckedItems.length === 0) {
            return 'Tümü';
        }

        switch (selection.checkedItems.length) {
            case 0:
                return 'Select options';
            case 1:
                return selection.checkedItems[0].text;
            default:
                return `${selection.checkedItems.length} options selected`;
        }
    }

    getAllCheckboxText(): string {
        return 'Tümünü Seç';
    }

    getFilterPlaceholder(): string {
        return 'Filtrele';
    }

    getFilterNoItemsFoundText(): string {
        return 'Bulunamadı';
    }

    getTooltipCollapseExpandText(isCollapse: boolean): string {
        return isCollapse ? 'Genişlet' : 'Topla';
    }
}
