import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSession } from '../services/auth-session';

/** Sends users who are not logged in to the login page. */
export const authGuard: CanActivateFn = () =>
  inject(AuthSession).isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
