import {
  AfterViewInit,
  Component,
  forwardRef,
  inject,
  model,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { InputMask, InputMaskModule } from 'primeng/inputmask';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { HERO_ICONS } from '../../icons';
import { CountryPhone, InputPhoneService } from './input-phone.service';
countries.registerLocale(enLocale);
@Component({
  selector: 'app-input-phone',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AutoCompleteModule,
    InputMaskModule,
    NgIconComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPhoneComponent),
      multi: true,
    },
    provideIcons(HERO_ICONS),
  ],
  templateUrl: './input-phone.component.html',
  styleUrl: './input-phone.component.scss',
})
export class InputPhoneComponent
  implements OnInit, AfterViewInit, ControlValueAccessor
{
  @ViewChild('phoneMask') phoneMask!: InputMask;
  @ViewChild('autoComplete') autoComplete!: AutoComplete;
  private readonly inputPhoneService = inject(InputPhoneService);
  countries = signal<CountryPhone[]>([]);
  selectedCountry = model<CountryPhone | undefined>();
  filteredCountries = signal<CountryPhone[]>([]);
  inputId = signal<string>(
    crypto.randomUUID().replace(/-/g, '').substring(0, 7)
  );
  isDropdownOpen = signal<boolean>(false);
  isCountryInputFocus = signal<boolean>(false);
  public phone = new FormControl('');
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};


  async ngOnInit(): Promise<void> {
    this.initializeCountries();
  }

  async ngAfterViewInit(): Promise<void> {
    await this.fetchUserCountry();
  }

  initializeCountries(): void {
    this.countries.set(this.inputPhoneService.getCountriesList());
  }

  async fetchUserCountry(): Promise<void> {
    try {
      const countryIso = await this.inputPhoneService.getUserCountryISO();
      if (!countryIso) return;
      this.selectedCountry.set(this.getCountryByKey('iso', countryIso));
      this.onSelectedCountry();
    } catch (error) {
      console.error('Error obteniendo país:', error);
    }
  }

  onOpenSuggestions() {
    if (this.autoComplete) {
      this.onFilterCountry({ query: '' } as AutoCompleteCompleteEvent);
      this.autoComplete.show(true);
    }
  }

  onInput(event: Event) {
    const inputElement = event.currentTarget as HTMLInputElement;
    const value = inputElement.value;
    if (value.replace(/[\s-]/g, '').length <= 1) {
      this.selectedCountry.set(undefined);
      return this.setAndFocusPhoneInput('+');
    }
    this.setCountryByPhoneNumber(value);
    this.onChange(value);
    this.onTouched();
  }

  onPhonePaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    this.setCountryByPhoneNumber(pastedText);
    this.onChange(pastedText);
    this.onTouched();
  }

  onFilterCountry(event: AutoCompleteCompleteEvent): void {
    let query = event.query;
    const filteredCountries = this.countries().filter(
      (country: CountryPhone) => {
        const keys: (keyof CountryPhone)[] = ['name', 'dialCode'];
        return keys.some((key: keyof CountryPhone) =>
          country[key].toLocaleLowerCase().includes(query.toLocaleLowerCase())
        );
      }
    );
    this.filteredCountries.set(filteredCountries);
  }

  onSelectedCountry() {
    console.log(this.selectedCountry());
    this.phone.reset();
    this.setAndFocusPhoneInput('+' + this.selectedCountry()?.dialCode, 10);
  }

  setCountryByPhoneNumber(phoneNumber: string) {
    const countryIso = this.inputPhoneService.getPhoneCountryISO(phoneNumber);
    if (!countryIso) return;
    const country = this.getCountryByKey('iso', countryIso);
    if (country?.iso === this.selectedCountry()?.iso) return;
    this.selectedCountry.set(country);
    this.setAndFocusPhoneInput(phoneNumber);
  }

  setAndFocusPhoneInput(phoneNumber: string, timer: number = 0) {
    const phoneMaskInput = this.phoneMask?.document?.getElementById(
      this.inputId()
    );
    if (phoneMaskInput instanceof HTMLInputElement) {
      phoneMaskInput.blur();
    }
    setTimeout(() => {
      this.phone.setValue(phoneNumber);
      this.phoneMask.focus();
    }, timer);
  }

  getCountryByKey<T extends keyof CountryPhone>(
    key: T,
    value: CountryPhone[T]
  ) {
    return this.countries()?.find((country) => country[key] === value);
  }

  writeValue(value: string): void {
    this.phone.setValue(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
