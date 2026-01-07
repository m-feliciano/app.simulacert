export interface AuthResponse {
  token: string;
  type: string;
  user: UserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name?: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface UserResponse {
  active: boolean;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: UserRole;
}

