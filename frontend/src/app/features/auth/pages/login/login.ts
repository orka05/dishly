import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiProblem } from '../../../../core/models/auth.models';
import { AuthApi } from '../../../../core/services/auth-api';
import { AuthSession } from '../../../../core/services/auth-session';
import { FormValidators } from '../../../../shared/validators/form-validators';

/** Messages shown after being redirected here, keyed by the `notice` query param. */
const NOTICES: Record<string, string> = {
  registered: 'Account created! Check your email for the activation link.',
  activated: 'Your account is activated. You can now log in.',
};

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['../../auth-form.css', './login.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);

  protected readonly notice: string | null =
    NOTICES[inject(ActivatedRoute).snapshot.queryParamMap.get('notice') ?? ''] ?? null;

  protected readonly form = this.formBuilder.nonNullable.group({
    identifier: ['', [Validators.required, FormValidators.emailOrUsername]],
    password: ['', Validators.required],
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authApi
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: ({ accessToken }) => {
          this.session.start(accessToken);
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.toMessage(error)),
      });
  }

  private toMessage(error: HttpErrorResponse): string {
    const problem = error.error as ApiProblem | null;
    // 401: wrong credentials, 403: account not activated. The server sends a user-friendly detail.
    if ((error.status === 401 || error.status === 403) && problem?.detail) {
      return problem.detail;
    }
    return 'Login failed. Please try again later.';
  }
}
