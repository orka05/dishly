import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthSession } from '../services/auth-session';

/** Adds the access token to every request sent to our own API. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSession);
  const router = inject(Router);
  const token = session.accessToken();

  // Never send the token to third-party URLs; logging in does not need one.
  if (!token || !request.url.startsWith('/api/') || request.url === '/api/auth/login') {
    return next(request);
  }

  const authorized = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(authorized).pipe(
    catchError((error: HttpErrorResponse) => {
      // The server no longer accepts the token (expired, revoked or signed with an old key).
      if (error.status === 401) {
        session.end();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
