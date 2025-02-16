import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  whitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      // Comprobar si el valor del campo está vacío o solo contiene espacios en blanco
      if (control.value && control.value.trim().length === 0) {
        return { invalid: true };
      }
      return null;
    };
  }

  digitValidator(position: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      // Comprobar si el valor del campo está vacío o solo contiene espacios en blanco
      if (
        control.value &&
        control.value.toString().trim().length !== position
      ) {
        return { invalid: true };
      }
      return null;
    };
  }

  matchFieldsValidator(
    controlName1: string,
    controlName2: string
  ): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
      const control1 = formGroup.get(controlName1);
      const control2 = formGroup.get(controlName2);

      if (!control1 || !control2) {
        return null;
      }

      if (control1.value !== control2.value) {
        return { mismatch: true };
      }
      return null;
    };
  }

  /**
   * Normalizes the text to ignore accents and special characters.
   * @param text - The text to be normalized.
   * @returns The normalized text without accents and in lowercase.
   */
  removeDiacritics(text: string): string {
    if (!text) return '';
    return text
      .normalize('NFD') // Decomposes accented characters into base characters and diacritics
      .replace(/[\u0300-\u036f]/g, '') // Removes diacritic characters
      .toLowerCase(); // Converts to lowercase
  }
}
