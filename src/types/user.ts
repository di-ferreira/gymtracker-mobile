import type { UserRole } from './common';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface UpdateProfileRequest {
  name?: string;
  current_password?: string;
  new_password?: string;
}

export interface AdminUpdateUserRequest {
  name?: string;
  role?: UserRole;
  is_active?: boolean;
}
