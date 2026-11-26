import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthApi } from '../../../../core/services/auth-api';

/** Opened from the activation email: /activate?token=... */
@Component({
  selector: 'app-activate-account',
  standalone: false,
  templateUrl: './activate-account.html',
  styleUrl: '../../auth-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivateAccount implements OnInit {
  private readonly authApi = inject(AuthApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly failed = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.failed.set(true);
      return;
    }

    this.authApi.activate(token).subscribe({
      next: () =>
        this.router.navigate(['/login'], {
          queryParams: { notice: 'activated' },
          replaceUrl: true,
        }),
      error: () => this.failed.set(true),
    });
  }
}
