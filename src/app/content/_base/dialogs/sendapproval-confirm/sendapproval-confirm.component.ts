import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material';

@Component({
  selector: 'kt-sendapproval-confirm',
  templateUrl: 'sendapproval-confirm.component.html',
})
export class SendApprovalConfirmComponent {
  constructor(private bottomSheetRef: MatBottomSheetRef<SendApprovalConfirmComponent>) { }

  doAction(event: MouseEvent, doIt: boolean = false): void {
    this.bottomSheetRef.dismiss(doIt);
    event.preventDefault();
  }
}
