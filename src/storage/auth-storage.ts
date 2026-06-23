import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'auth-storage' });

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getAccessToken(): string | undefined {
  return storage.getString(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  storage.set(ACCESS_TOKEN_KEY, token);
}

export function getRefreshToken(): string | undefined {
  return storage.getString(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  storage.set(REFRESH_TOKEN_KEY, token);
}

export function clearTokens(): void {
  storage.remove(ACCESS_TOKEN_KEY);
  storage.remove(REFRESH_TOKEN_KEY);
}

export function hasToken(): boolean {
  return storage.contains(ACCESS_TOKEN_KEY);
}
