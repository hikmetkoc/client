import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material';

@Component({
  selector: 'kt-gotoapproval-confirm',
  templateUrl: 'gotoapproval-confirm.component.html',
})
export class GotoApprovalConfirmComponent {
  constructor(private bottomSheetRef: MatBottomSheetRef<GotoApprovalConfirmComponent>) { }

  doAction(event: MouseEvent, doIt: boolean = false): void {
    this.bottomSheetRef.dismiss(doIt);
    event.preventDefault();
  }
}
