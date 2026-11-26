import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

// Angular's built-in email validator accepts addresses without a TLD (e.g. "user@example").
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9._]+$/;

const isEmpty = (value: unknown): boolean => value === null || value === undefined || value === '';

export class FormValidators {
  static email(control: AbstractControl): ValidationErrors | null {
    if (isEmpty(control.value)) {
      return null;
    }
    return EMAIL_PATTERN.test(control.value) ? null : { email: true };
  }

  static username(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
    if (isEmpty(value)) {
      return null;
    }
    if (value.length < USERNAME_MIN_LENGTH || value.length > USERNAME_MAX_LENGTH) {
      return { usernameLength: true };
    }
    return USERNAME_PATTERN.test(value) ? null : { usernamePattern: true };
  }

  /** Accepts either a valid email address or a valid username. */
  static emailOrUsername(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
    if (isEmpty(value)) {
      return null;
    }
    if (value.includes('@')) {
      return FormValidators.email(control);
    }
    return FormValidators.username(control) ? { emailOrUsername: true } : null;
  }

  static password(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
    if (isEmpty(value)) {
      return null;
    }
    if (value.length < PASSWORD_MIN_LENGTH) {
      return { passwordLength: true };
    }
    if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
      return { passwordComplexity: true };
    }
    return null;
  }

  /** Validates that the control's value equals the value of a sibling control. */
  static matches(siblingName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sibling = control.parent?.get(siblingName);
      if (!sibling || isEmpty(control.value)) {
        return null;
      }
      return control.value === sibling.value ? null : { mismatch: true };
    };
  }
}

export const VALIDATION_MESSAGES: Record<string, string> = {
  required: 'This field is required.',
  email: 'Enter a valid email address.',
  usernameLength: `Username must be ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} characters long.`,
  usernamePattern: 'Username can contain only letters, numbers, dots and underscores.',
  emailOrUsername: 'Enter a valid email address or username.',
  passwordLength: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
  passwordComplexity: 'Password must contain at least one letter and one number.',
  mismatch: 'Passwords do not match.',
};
