import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '../../types';
import { login as apiLogin, register as apiRegister, getMe } from '../../services/auth-service';
import { hasToken, clearTokens, clearAll } from '../../storage';
import { refreshBaseUrl } from '../../services/api';

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  checkAuth: async () => {
    await refreshBaseUrl();
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
    await refreshBaseUrl();

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
    await refreshBaseUrl();

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
      await clearTokens();
    }
    await clearAll();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  clearError: () => set({ error: null }),
}));
