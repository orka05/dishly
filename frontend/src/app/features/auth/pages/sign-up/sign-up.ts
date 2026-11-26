import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiProblem } from '../../../../core/models/auth.models';
import { AuthApi } from '../../../../core/services/auth-api';
import { availabilityValidator } from '../../../../shared/validators/async-validators';
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
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly form = this.formBuilder.nonNullable.group({
    username: [
      '',
      {
        validators: [Validators.required, FormValidators.username],
        asyncValidators: availabilityValidator(
          (value) => this.authApi.isUsernameAvailable(value),
          'usernameTaken',
        ),
      },
    ],
    email: [
      '',
      {
        validators: [Validators.required, FormValidators.email],
        asyncValidators: availabilityValidator(
          (value) => this.authApi.isEmailAvailable(value),
          'emailTaken',
        ),
      },
    ],
    password: ['', [Validators.required, FormValidators.password]],
    confirmPassword: ['', [Validators.required, FormValidators.matches('password')]],
    acceptTerms: [false, Validators.requiredTrue],
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // A signal is needed because async validators finish outside of any template event.
  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });
  protected readonly canSubmit = computed(
    () => this.formStatus() === 'VALID' && !this.submitting(),
  );

  constructor() {
    const { password, confirmPassword } = this.form.controls;
    password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => confirmPassword.updateValueAndValidity());
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authApi
      .register({ username, email, password })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/login'], { queryParams: { notice: 'registered' } }),
        error: (error: HttpErrorResponse) => this.handleError(error),
      });
  }

  private handleError(error: HttpErrorResponse): void {
    const problem = error.error as ApiProblem | null;

    if (error.status === 409 && problem?.errors) {
      for (const field of Object.keys(problem.errors)) {
        const control = this.form.get(field);
        control?.setErrors({ [`${field}Taken`]: true });
        control?.markAsTouched();
      }
      return;
    }

    this.errorMessage.set('Registration failed. Please try again later.');
  }
}
