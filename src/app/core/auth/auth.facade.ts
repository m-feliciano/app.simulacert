import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, shareReplay } from 'rxjs/operators';
import { AuthApiService } from '../../api/auth.service';
import { LoginRequest, RegisterRequest, UserResponse, AuthResponse } from '../../api/domain';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private readonly TOKEN_KEY = 'simulaaws_token';
  private readonly USER_KEY = 'simulaaws_user';

  private state$ = new BehaviorSubject<AuthState>({
    user: this.loadUserFromStorage(),
    token: this.loadTokenFromStorage(),
    isAuthenticated: !!this.loadTokenFromStorage()
  });

  readonly user$ = this.state$.pipe(
    shareReplay(1)
  );

  constructor(private authApi: AuthApiService) {}

  get currentUser(): UserResponse | null {
    return this.state$.value.user;
  }

  get isAuthenticated(): boolean {
    return this.state$.value.isAuthenticated;
  }

  get token(): string | null {
    return this.state$.value.token;
  }

  get isAdmin(): boolean {
    return this.state$.value.user?.role === 'ADMIN';
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.authApi.login(request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.authApi.register(request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearAuth();
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.state$.next({
      user: response.user,
      token: response.token,
      isAuthenticated: true
    });
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.state$.next({
      user: null,
      token: null,
      isAuthenticated: false
    });
  }

  private loadTokenFromStorage(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromStorage(): UserResponse | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}

