import {computed, Inject, Injectable, signal} from '@angular/core';
import {map, Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {AuthApiService} from '../../api/auth.service';
import {AuthResponse, LoginRequest, RegisterRequest, UserResponse} from '../../api/domain';
import {HttpResponse} from '@angular/common/http';
import {LOCAL_STORAGE} from '../storage/local-storage.token';

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
    user: null,
    token: null,
    isAuthenticated: false
  });

  readonly isAnonymous = computed(() => this.state()?.user?.type == "ANONYMOUS");
  readonly currentUser = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly token = computed(() => this.state().token);
  readonly isAdmin = computed(() => this.state().user?.role === 'ADMIN');

  constructor(
    private authApi: AuthApiService,
    @Inject(LOCAL_STORAGE) private storage: Storage | null,
  ) {
    const token = this.loadTokenFromStorage();
    const user = this.loadUserFromStorage();

    this.state.set({
      user,
      token,
      isAuthenticated: !!token,
    });
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

  register(request: RegisterRequest): Observable<HttpResponse<void>> {
    const current = this.storage?.getItem(this.USER_KEY) ?? null;
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
    this.storage?.setItem(this.TOKEN_KEY, token);

    this.state.set({
      user: null,
      token: token,
      isAuthenticated: true
    });

    this.loadCurrentUser();
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
      ? currentRefreshToken : `Bearer ${currentRefreshToken}`;

    return this.authApi.refreshToken(bearerToken).pipe(
      tap(({token, refreshToken}) => {
        this.storage?.setItem(this.TOKEN_KEY, token);
        this.storage?.setItem(this.REFRESH_KEY, refreshToken);

        this.state.update(s => ({
          ...s,
          token: token,
          isAuthenticated: true
        }));
      }),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
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

  createAnonymousUser(): Observable<UserResponse> {
    return this.authApi.createAnonymousUser().pipe(
      tap(auth => {
        this.handleAuthSuccess(auth);
      }),
      map((auth) => auth.user)
    );
  }

  refreshToken() {
    return this.storage?.getItem(this.REFRESH_KEY) ?? null;
  }

  private loadTokenFromStorage(): string | null {
    return this.storage?.getItem(this.TOKEN_KEY) ?? null;
  }

  private loadUserFromStorage(): UserResponse | null {
    const userJson = this.storage?.getItem(this.USER_KEY) ?? null;
    return userJson ? JSON.parse(userJson) : null;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.storage?.setItem(this.TOKEN_KEY, response.token);
    this.storage?.setItem(this.REFRESH_KEY, response.refreshToken);
    this.storage?.setItem(this.USER_KEY, JSON.stringify(response.user));

    this.state.set({
      user: response.user,
      token: response.token,
      isAuthenticated: true
    });
  }

  private clearAuth(): void {
    this.storage?.removeItem(this.USER_KEY);
    this.storage?.removeItem(this.TOKEN_KEY);
    this.storage?.removeItem(this.REFRESH_KEY);

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
        this.storage?.setItem(this.USER_KEY, JSON.stringify(user));
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

