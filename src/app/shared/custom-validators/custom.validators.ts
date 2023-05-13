import { AbstractControl } from '@angular/forms';

export class CustomValidators {
  static minDate(controlOfMinDate: AbstractControl) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const currentDate: Date = new Date(control.value);
      const minDate: Date = new Date(controlOfMinDate.value);
      if (currentDate > minDate) {
        return null;
      } else {
        return { minDate: true };
      }
    };
  }
}
