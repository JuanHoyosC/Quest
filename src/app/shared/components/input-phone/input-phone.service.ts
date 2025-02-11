import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PhoneNumberUtil } from 'google-libphonenumber';
import countries from 'i18n-iso-countries';
import parsePhoneNumberFromString, {
  CountryCallingCode,
  CountryCode,
  getCountryCallingCode,
  getExampleNumber,
} from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';

@Injectable({
  providedIn: 'root',
})
export class InputPhoneService {
  public async getUserCountryISO(): Promise<string | null> {
    try {
      const response = await fetch('https://ipinfo.io/json');
      const data = await response.json();
      return data.country || null;
    } catch {
      return null;
    }
  }

  public getPhoneCountryISO(phoneNumber: string): string | null {
    try {
      const phone = parsePhoneNumberFromString(phoneNumber);
      return phone?.country ?? null;
    } catch (error) {
      return null;
    }
  }

  public phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      try {
        const phoneUtil = PhoneNumberUtil.getInstance();
        const number = phoneUtil.parseAndKeepRawInput(control.value);
        return phoneUtil.isValidNumber(number)
          ? null
          : { invalidPhoneNumber: true };
      } catch (error) {
        return { invalidPhoneNumber: true };
      }
    };
  }
  public getCountriesList(): CountryPhone[] {
    const countryCodes = Object.keys(countries.getAlpha2Codes());
    return countryCodes
      .map((iso2) => this.createCountryPhone(iso2))
      .filter((country): country is CountryPhone => country !== undefined);
  }

  private createCountryPhone(iso2: string): CountryPhone | undefined {
    try {
      const { name, placeholder } = this.getCountryDetails(iso2);
      return {
        iso: iso2,
        name: name,
        dialCode: getCountryCallingCode(iso2 as CountryCode),
        placeholder,
        mask: this.generatePrimeMask(placeholder),
        flagClass: `fi fi-${iso2.toLowerCase()}`,
      };
    } catch (error) {
      return undefined;
    }
  }

  private getCountryDetails(iso2: string): {
    name: string;
    placeholder: string;
  } {
    const countryName = countries.getName(iso2, 'en') ?? 'Unknown';
    const exampleNumber = getExampleNumber(iso2 as CountryCode, examples);
    const placeholder = exampleNumber
      ? exampleNumber.formatInternational()
      : '';
    return { name: countryName, placeholder };
  }

  private generatePrimeMask(placeholder: string): string {
    return placeholder.replace(/\d/g, '9');
  }

  clearFormattedMaskPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/[\s-]/g, '');
  }
}

export declare class CountryPhone {
  iso: string;
  name: string;
  dialCode: CountryCallingCode;
  placeholder: string;
  mask: string;
  flagClass: `fi fi-${string}`;
}
