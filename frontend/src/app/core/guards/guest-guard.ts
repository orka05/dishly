import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSession } from '../services/auth-session';

/** Keeps logged-in users away from the login and sign-up pages. */
export const guestGuard: CanActivateFn = () =>
  inject(AuthSession).isLoggedIn() ? inject(Router).createUrlTree(['/']) : true;
