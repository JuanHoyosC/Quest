import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  input,
  OnChanges,
  Output,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'd-otp-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DotpInputComponent),
      multi: true,
    },
  ],
  templateUrl: './d-otp-input.component.html',
  styleUrl: './d-otp-input.component.css',
})
export class DotpInputComponent implements ControlValueAccessor, OnChanges {
  @ViewChildren('OtpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;
  length = input<number>(6);
  appId = input<string>();
  digits = signal<Digit[]>([]);
  value: number | undefined = undefined;
  isDisabled: boolean = false;
  constructor() {}

  ngOnChanges(): void {
    this.digits.set(new Array(this.length()).fill({ digit: undefined }));
  }
  onChange = (value: number) => {};
  onTouched = () => {};

  writeValue(value: number): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  getValue() {
    return this.digits()
      .filter(({ digit }: Digit) => digit !== undefined)
      .map(({ digit }) => digit)
      .join('');
  }

  onBlur() {
    this.onTouched();
  }
  onInput(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }

  onKeyDown(event: KeyboardEvent, digitPos: number) {
    const key = event.key;
    if (this.isNumeric(key)) {
      this.setInputFocus(digitPos + 1);
      this.updateDigits(key, digitPos);
      return;
    }

    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];
    if (!allowedKeys.includes(key)) {
      return this.updateDigits(undefined, digitPos);
    }
    if (key === 'Backspace' || key === 'Delete') {
      this.updateDigits(undefined, digitPos);
      return this.setInputFocus(digitPos - 1);
    }
    if (key === 'ArrowLeft') {
      return this.setInputFocus(digitPos - 1);
    }
    this.setInputFocus(digitPos + 1);
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text') ?? '';
    const numbers = pastedText.replace(/\D/g, '').slice(0, 6).split('');
    const isValidPaste = this.isValidPaste(pastedText);
    if (!isValidPaste) return;
    numbers.forEach((number, i) => {
      const currentInput = this.getInputElement(i);
      if (currentInput) {
        this.updateDigits(number, i);
        this.setInputFocus(i);
      }
    });
  }

  isValidPaste(pastedText: string): boolean {
    return this.isNumeric(pastedText);
  }

  isNumeric(value: string) {
    return /^\d+$/.test(value);
  }

  getInputElement(index: number): ElementRef<HTMLInputElement> | undefined {
    const currentIonInput: ElementRef<HTMLInputElement> | undefined =
      this.otpInputs.get(index);
    return currentIonInput ?? undefined;
  }

  setInputFocus(nextPos: number): void {
    const length = this.length();
    nextPos = Math.max(0, Math.min(nextPos, length - 1));
    const nextInput = this.getInputElement(nextPos);
    if (!nextInput) return;
    setTimeout(() => {
      nextInput.nativeElement.focus();
      nextInput.nativeElement.select();
    }, 0);
  }

  updateDigits(digit: string | undefined, digitPosition: number) {
    this.digits.update((value) => {
      const newArray = structuredClone(value);
      newArray[digitPosition] = { digit };
      return newArray;
    });
    this.onBlur();
    this.updateOtpValue();
  }

  updateOtpValue() {
    const digits = this.digits();
    if (digits.every((digit) => digit !== undefined)) {
      this.onChange(Number(digits.map(({ digit }) => digit).join('')));
    }
  }
}
export type Digit = {
  digit: string | undefined;
};
