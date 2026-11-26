import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  AvailabilityResponse,
  MessageResponse,
  RegisterRequest,
  RegisterResponse,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, request);
  }

  isUsernameAvailable(username: string): Observable<boolean> {
    return this.checkAvailability('username', username);
  }

  isEmailAvailable(email: string): Observable<boolean> {
    return this.checkAvailability('email', email);
  }

  activate(token: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/activate`, { token });
  }

  private checkAvailability(field: 'username' | 'email', value: string): Observable<boolean> {
    return this.http
      .get<AvailabilityResponse>(`${this.baseUrl}/availability/${field}`, { params: { value } })
      .pipe(map((response) => response.available));
  }
}
