import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthSession } from '../../core/services/auth-session';
import { SiteNavigation } from '../../layout/site-navigation/site-navigation';

@Component({
  selector: 'app-account-page',
  imports: [SiteNavigation],
  templateUrl: './account-page.html',
  styleUrl: './account-page.css',
})
export class AccountPage {
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);

  protected logout(): void {
    this.session.end();
    this.router.navigate(['/']);
  }
}
