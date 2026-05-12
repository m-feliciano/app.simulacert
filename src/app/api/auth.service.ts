import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthResponse, ChangePasswordRequest, LoginRequest, RegisterRequest, UserResponse} from './domain';
import {API_CONFIG, ApiConfig} from './config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly config: ApiConfig
  ) {
    this.baseUrl = `${this.config.baseUrl}/api/v1/auth`;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<HttpResponse<void>> {
    return this.http.post<void>(
      `${this.baseUrl}/register`,
      request,
      { observe: 'response' }
    );
  }

  getUserById(userId: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/users/${userId}`);
  }

  getUserByEmail(email: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/users/email/${email}`);
  }

  changePassword(userId: string, request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/users/${userId}/password`, request);
  }

  activateUser(userId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/users/${userId}/activate`, {});
  }

  deactivateUser(userId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/users/${userId}/deactivate`, {});
  }

  exchangeGoogleCode(code: string, state: string) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/oauth/google/exchange`, {code, state});
  }

  getCurrentUser() {
    return this.http.get<UserResponse>(`${this.baseUrl}/me`);
  }

  createAnonymousUser(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/users/anonymous`, {});
  }

  getUsers(email?: string): Observable<UserResponse[]> {
    let url = `${this.baseUrl}/users`;
    if (email) {
      url += `?email=${encodeURIComponent(email)}`;
    }
    return this.http.get<UserResponse[]>(url);
  }

  refreshToken(refreshToken: string): Observable<{ token: string, refreshToken: string }> {
    return this.http.post<{
      token: string,
      refreshToken: string
    }>(`${this.baseUrl}/refresh-token`, {refreshToken: refreshToken});
  }
}
