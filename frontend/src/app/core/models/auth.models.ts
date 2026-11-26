export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  activated: boolean;
  createdAt: string;
  message: string;
}

export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  /** Username or email address. */
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  user: AuthUser;
}

export interface MessageResponse {
  message: string;
}

export interface AvailabilityResponse {
  available: boolean;
}

/** RFC 9457 problem details returned by the backend. */
export interface ApiProblem {
  status: number;
  detail?: string;
  /** Field name -> error code (e.g. `{ username: 'taken' }`). */
  errors?: Record<string, string>;
}
