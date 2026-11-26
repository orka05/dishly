import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';

import { FormValidators } from '../../../../shared/validators/form-validators';

@Component({
  selector: 'app-sign-up',
  standalone: false,
  templateUrl: './sign-up.html',
  styleUrls: ['../../auth-form.css', './sign-up.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUp {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, FormValidators.username]],
    email: ['', [Validators.required, FormValidators.email]],
    password: ['', [Validators.required, FormValidators.password]],
    confirmPassword: ['', [Validators.required, FormValidators.matches('password')]],
    acceptTerms: [false, Validators.requiredTrue],
  });

  constructor() {
    const { password, confirmPassword } = this.form.controls;
    password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => confirmPassword.updateValueAndValidity());
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // TODO: Register via AuthService once the backend API is available.
  }
}
