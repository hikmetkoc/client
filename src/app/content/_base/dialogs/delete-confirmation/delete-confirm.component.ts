import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material';

@Component({
  selector: 'kt-delete-confirm',
  templateUrl: 'delete-confirm.component.html',
})
export class DeleteConfirmComponent {
  constructor(private bottomSheetRef: MatBottomSheetRef<DeleteConfirmComponent>) { }

  doAction(event: MouseEvent, doIt: boolean = false): void {
    this.bottomSheetRef.dismiss(doIt);
    event.preventDefault();
  }
}
