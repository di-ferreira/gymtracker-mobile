import { api } from './api';
import type { User, RegisterRequest, LoginRequest, TokenResponse, UpdateProfileRequest } from '../types';
import { setAccessToken, clearTokens } from '../storage';

export async function register(data: RegisterRequest): Promise<User> {
  const response = await api.post<User>('/auth/register', data);
  return response.data;
}

export async function login(data: LoginRequest): Promise<TokenResponse & { user: User }> {
  const response = await api.post<TokenResponse & { user: User }>('/auth/login', data);
  setAccessToken(response.data.access_token);
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await api.patch<User>('/auth/me', data);
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    clearTokens();
  }
}
