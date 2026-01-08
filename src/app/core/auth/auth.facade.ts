import {computed, Injectable, signal} from '@angular/core';
import {defer, map, Observable, of, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {AuthApiService} from '../../api/auth.service';
import {AuthResponse, LoginRequest, RegisterRequest, UserResponse} from '../../api/domain';
import {HttpResponse} from '@angular/common/http';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private readonly USER_KEY = 'simulacert_user';
  private readonly TOKEN_KEY = 'simulacert_token';
  private readonly REFRESH_KEY = 'refresh_token';

  private state = signal<AuthState>({
    user: this.loadUserFromStorage(),
    token: this.loadTokenFromStorage(),
    isAuthenticated: !!this.loadTokenFromStorage()
  });

  readonly isAnonymous = computed(() => this.state()?.user?.type == "ANONYMOUS");
  readonly currentUser = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly token = computed(() => this.state().token);
  readonly isAdmin = computed(() => this.state().user?.role === 'ADMIN');

  constructor(private authApi: AuthApiService) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.authApi.login(request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<HttpResponse<void>> {
    const current = localStorage.getItem(this.USER_KEY);
    if (current) {
      const anonUser: UserResponse = JSON.parse(current);
      request.id = anonUser.id;
    }

    return this.authApi.register(request)
      .pipe(
        tap((response) => {
          if (response && response.status === 200) {
            this.clearAuth();
          }
        }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  handleOAuthCallback(token: string): void {
    // O backend já retorna o token JWT pronto para uso
    localStorage.setItem(this.TOKEN_KEY, token);

    this.state.set({
      user: null,
      token: token,
      isAuthenticated: true
    });

    this.loadCurrentUser();
  }

  logout(): void {
    this.clearAuth();
  }

  exchangeGoogleCode(code: string, state: string): Observable<AuthResponse> {
    return this.authApi.exchangeGoogleCode(code, state).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  ensureAuthenticated(): Observable<UserResponse | null> {
    return defer(() => {
      const current = this.currentUser();
      if (current) {
        return of(current);
      }

      const stored = localStorage.getItem(this.USER_KEY);
      if (stored) {
        const user: UserResponse = JSON.parse(stored);
        this.updateUserState(user);
        return of(user);
      }

      return of(null);
    });
  }

  createAnonymousUser(): Observable<UserResponse> {
    return this.authApi.createAnonymousUser().pipe(
      tap(auth => {
        this.handleAuthSuccess(auth);
      }),
      map((auth) => auth.user)
    );
  }

  generateRefreshToken() {
    if (!this.token()) {
      return throwError(() => new Error('No token available for refresh'));
    }

    const currentRefreshToken = this.refreshToken();
    if (!currentRefreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const bearerToken = currentRefreshToken.startsWith('Bearer ')
      ? currentRefreshToken
      : `Bearer ${currentRefreshToken}`;

    return this.authApi.refreshToken(bearerToken).pipe(
      tap(({token, refreshToken}) => {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.REFRESH_KEY, refreshToken);

        this.state.update(s => ({
          ...s,
          token: token,
          authenticated: true
        }));
      }),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  refreshToken() {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  private loadTokenFromStorage(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromStorage(): UserResponse | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

    this.state.set({
      user: response.user,
      token: response.token,
      isAuthenticated: true
    });
  }

  private clearAuth(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);

    this.state.set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  }

  private loadCurrentUser() {
    this.authApi.getCurrentUser().subscribe({
      next: user => {
        this.updateUserState(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      },
      error: () => {
        this.clearAuth();
      }
    });
  }

  private updateUserState(user: UserResponse): void {
    this.state.update(s => ({
      ...s,
      user: user
    }));
  }
}

