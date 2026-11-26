export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  activated: boolean;
  createdAt: string;
  message: string;
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
