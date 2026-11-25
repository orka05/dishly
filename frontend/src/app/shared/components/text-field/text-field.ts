import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { VALIDATION_MESSAGES } from '../../validators/form-validators';

type TextFieldType = 'text' | 'email' | 'password';

let nextId = 0;

@Component({
  selector: 'app-text-field',
  standalone: false,
  templateUrl: './text-field.html',
  styleUrl: './text-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextField implements ControlValueAccessor, OnInit {
  readonly label = input.required<string>();
  readonly type = input<TextFieldType>('text');
  readonly autocomplete = input('off');

  protected readonly id = `text-field-${nextId++}`;
  protected readonly errorId = `${this.id}-error`;
  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly passwordVisible = signal(false);

  protected readonly isPassword = computed(() => this.type() === 'password');
  protected readonly inputType = computed(() =>
    this.isPassword() && this.passwordVisible() ? 'text' : this.type(),
  );

  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    // Status/touched changes can be triggered from outside (e.g. markAllAsTouched on submit).
    this.ngControl?.control?.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.changeDetector.markForCheck());
  }

  protected get hasError(): boolean {
    const control = this.ngControl?.control;
    return !!control && control.invalid && control.touched;
  }

  protected get isValid(): boolean {
    const control = this.ngControl?.control;
    return !!control && control.valid && control.touched && !!this.value();
  }

  protected get errorMessage(): string {
    const errors = this.ngControl?.errors;
    const firstKey = errors ? Object.keys(errors)[0] : null;
    return firstKey ? (VALIDATION_MESSAGES[firstKey] ?? 'Invalid value.') : '';
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }
}
