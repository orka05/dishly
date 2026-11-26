import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthSession } from '../../core/services/auth-session';

interface NavigationItem {
  readonly label: string;
  readonly icon: string;
  /** Items without a path are shown as disabled until their page exists. */
  readonly path?: string;
}

@Component({
  selector: 'app-site-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-navigation.html',
  styleUrl: './site-navigation.css',
})
export class SiteNavigation {
  readonly showMobileNavigation = input(true);

  private readonly session = inject(AuthSession);

  protected readonly navigation = computed<readonly NavigationItem[]>(() => [
    { label: 'Home', icon: 'home', path: '/' },
    { label: 'Meal Plan', icon: 'meal-plan' },
    { label: 'Groceries', icon: 'groceries' },
    { label: 'Favorites', icon: 'favorites' },
    this.session.isLoggedIn()
      ? { label: 'Account', icon: 'account', path: '/account' }
      : { label: 'Log in', icon: 'account', path: '/login' },
  ]);
}
