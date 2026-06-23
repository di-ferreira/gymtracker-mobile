import { describe, it, expect } from 'vitest';
import { MOCK_USER, MOCK_TOKEN } from '../mock';

describe('AuthStore', () => {
  it('should have mock user available', () => {
    expect(MOCK_USER).toBeDefined();
    expect(MOCK_USER.email).toBe('teste@gymtracker.com');
    expect(MOCK_USER.name).toBe('Usuário Teste');
  });

  it('should have mock token available', () => {
    expect(MOCK_TOKEN).toBe('mock-jwt-token-dev-only');
  });

  it('should have initial auth store state', async () => {
    const { useAuthStore } = await import('../store');
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(typeof state.login).toBe('function');
    expect(typeof state.register).toBe('function');
    expect(typeof state.logout).toBe('function');
  });
});
