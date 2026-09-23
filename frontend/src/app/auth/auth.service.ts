import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../users/user.model';
import { LoginResponse } from './auth.model';

const TOKEN_KEY = 'access_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();

  get token(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          sessionStorage.setItem(TOKEN_KEY, response.access_token);
          this.currentUserSignal.set(response.user);
        }),
        map((response) => response.user),
      );
  }

  loadCurrentUser(): Observable<User> {
    return this.http
      .get<User>(`${environment.apiUrl}/api/auth/me`)
      .pipe(tap((user) => this.currentUserSignal.set(user)));
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }
}
