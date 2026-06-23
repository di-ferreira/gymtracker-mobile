import { describe, it, expect, vi } from 'vitest';

vi.mock('../../services/api', () => ({
  refreshBaseUrl: vi.fn(),
}));

vi.mock('../../services/auth-service', () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../../storage', () => ({
  hasToken: vi.fn(() => Promise.resolve(false)),
  clearTokens: vi.fn(),
  clearAll: vi.fn(),
}));

describe('AuthStore', () => {
  it('should have initial auth store state', async () => {
    const { useAuthStore } = await import('../store');
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(typeof state.login).toBe('function');
    expect(typeof state.register).toBe('function');
    expect(typeof state.logout).toBe('function');
  });

  it('should start not authenticated when no token', async () => {
    const { useAuthStore } = await import('../store');
    await useAuthStore.getState().checkAuth();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
