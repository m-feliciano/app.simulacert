import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse, ChangePasswordRequest } from './domain';
import { API_CONFIG, ApiConfig } from './config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private config: ApiConfig
  ) {
    this.baseUrl = `${this.config.baseUrl}/api/v1/auth`;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request);
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
}

