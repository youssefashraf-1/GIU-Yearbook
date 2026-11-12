import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, shareReplay, tap, throwError } from 'rxjs';
import { LoginPayload, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly options = { withCredentials: true, transferCache: false };
  private readonly _currentUser = signal<User | null>(null);
  private sessionCheck?: Observable<User>;
  private sessionVersion = 0;

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  login(credentials: LoginPayload): Observable<User> {
    return this.http.post<User>('/mock-api/login', credentials, this.options).pipe(
      tap((user) => {
        this.sessionVersion++;
        this._currentUser.set(user);
      }),
    );
  }

  checkSession(): Observable<User> {
    if (!this.sessionCheck) {
      const version = this.sessionVersion;
      this.sessionCheck = this.http.get<User>('/mock-api/me', this.options).pipe(
        tap((user) => {
          if (version === this.sessionVersion) {
            this._currentUser.set(user);
          }
        }),
        catchError((error: unknown) => {
          if (version === this.sessionVersion) {
            this._currentUser.set(null);
          }
          return throwError(() => error);
        }),
        finalize(() => (this.sessionCheck = undefined)),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    }
    return this.sessionCheck;
  }

  logout(): Observable<void> {
    return this.http.post<void>('/mock-api/logout', {}, this.options).pipe(
      tap(() => {
        this.sessionVersion++;
        this._currentUser.set(null);
      }),
    );
  }
}
