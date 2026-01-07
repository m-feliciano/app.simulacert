import {computed, Injectable, signal} from '@angular/core';
import {Observable, throwError} from 'rxjs';
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
  private readonly TOKEN_KEY = 'simulacert_token';
  private readonly USER_KEY = 'simulacert_user';

  private state = signal<AuthState>({
    user: this.loadUserFromStorage(),
    token: this.loadTokenFromStorage(),
    isAuthenticated: !!this.loadTokenFromStorage()
  });

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
    return this.authApi.register(request).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  handleOAuthCallback(token: string): void {
    // O backend já retorna o token JWT pronto para uso
    localStorage.setItem(this.TOKEN_KEY, token);

    this.state.set({
      user: null, // Será carregado depois
      token: token,
      isAuthenticated: true
    });
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

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

    this.state.set({
      user: response.user,
      token: response.token,
      isAuthenticated: true
    });
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.state.set({
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

