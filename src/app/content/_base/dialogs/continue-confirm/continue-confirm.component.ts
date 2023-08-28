import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material';

@Component({
  selector: 'kt-continue-confirm',
  templateUrl: 'continue-confirm.component.html',
})
export class ContinueConfirmComponent {
  constructor(private bottomSheetRef: MatBottomSheetRef<ContinueConfirmComponent>) { }

  doAction(event: MouseEvent, doIt: boolean = false): void {
    this.bottomSheetRef.dismiss(doIt);
    event.preventDefault();
  }
}
