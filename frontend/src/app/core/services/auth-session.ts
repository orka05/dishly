import { Injectable, computed, signal } from '@angular/core';

import { AuthUser, UserRole } from '../models/auth.models';

const TOKEN_KEY = 'dishly.accessToken';

interface TokenClaims {
  sub: string;
  username: string;
  email: string;
  role: UserRole;
  /** Expiration time in seconds since the epoch. */
  exp: number;
}

/**
 * Keeps the access token in localStorage so the user stays logged in after closing the tab or
 * browser, until they log out or the token expires.
 */
@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly token = signal<string | null>(readStoredToken());

  readonly accessToken = this.token.asReadonly();
  readonly user = computed<AuthUser | null>(() => {
    const claims = decodeClaims(this.token());
    return claims
      ? {
          id: Number(claims.sub),
          username: claims.username,
          email: claims.email,
          role: claims.role,
        }
      : null;
  });
  readonly isLoggedIn = computed(() => this.user() !== null);

  constructor() {
    // Logging in or out in one tab updates every other open tab.
    window.addEventListener('storage', (event) => {
      if (event.key === TOKEN_KEY) {
        this.token.set(readStoredToken());
      }
    });
  }

  start(accessToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    this.token.set(accessToken);
  }

  end(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }
}

function readStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && decodeClaims(token)) {
    return token;
  }
  localStorage.removeItem(TOKEN_KEY);
  return null;
}

/**
 * Reads the JWT payload for display purposes only. The signature is verified by the backend,
 * which is the only place that decides what the user is allowed to do.
 */
function decodeClaims(token: string | null): TokenClaims | null {
  if (!token) {
    return null;
  }
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = new TextDecoder().decode(Uint8Array.from(atob(payload), (c) => c.charCodeAt(0)));
    const claims = JSON.parse(json) as TokenClaims;
    return claims.exp * 1000 > Date.now() ? claims : null;
  } catch {
    return null;
  }
}
