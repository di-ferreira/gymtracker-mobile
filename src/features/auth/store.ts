import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '../../types';
import { login as apiLogin, register as apiRegister, getMe } from '../../services/auth-service';
import { hasToken, clearTokens, clearAll, setAccessToken } from '../../storage';
import { mockLogin, mockRegister, MOCK_USER, MOCK_TOKEN } from './mock';

const USE_MOCK_AUTH = true;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

async function mockCheckAuth(): Promise<User | null> {
  const hasTokenValue = await hasToken();
  if (hasTokenValue) {
    return MOCK_USER;
  }
  return null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  checkAuth: async () => {
    if (USE_MOCK_AUTH) {
      const user = await mockCheckAuth();
      set({
        user,
        isAuthenticated: user !== null,
        isLoading: false,
      });
      return;
    }

    const tokenExists = await hasToken();
    if (!tokenExists) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });

    if (USE_MOCK_AUTH) {
      await new Promise((r) => setTimeout(r, 500));
      await setAccessToken(MOCK_TOKEN);
      set({ user: MOCK_USER, isLoading: false, isAuthenticated: true });
      return;
    }

    try {
      await apiLogin(data);
      const user = await getMe();
      set({ user, isLoading: false, isAuthenticated: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });

    if (USE_MOCK_AUTH) {
      await new Promise((r) => setTimeout(r, 500));
      await setAccessToken(MOCK_TOKEN);
      set({ user: MOCK_USER, isLoading: false, isAuthenticated: true });
      return;
    }

    try {
      await apiRegister(data);
      await apiLogin({ email: data.email, password: data.password });
      const user = await getMe();
      set({ user, isLoading: false, isAuthenticated: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    try {
      const { logout: apiLogout } = await import('../../services/auth-service');
      await apiLogout();
    } catch {
      // ignore error
    }
    await clearAll();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  clearError: () => set({ error: null }),
}));
