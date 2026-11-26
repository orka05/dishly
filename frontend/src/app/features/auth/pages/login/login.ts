import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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

  protected readonly notice: string | null =
    NOTICES[inject(ActivatedRoute).snapshot.queryParamMap.get('notice') ?? ''] ?? null;

  protected readonly form = this.formBuilder.nonNullable.group({
    identifier: ['', [Validators.required, FormValidators.emailOrUsername]],
    password: ['', Validators.required],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // TODO: Authenticate via AuthService once the backend API is available.
  }
}
