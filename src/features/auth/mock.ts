import type { User } from '../../types';
import { setAccessToken, setOnboardingDone } from '../../storage';

export const MOCK_USER: User = {
  id: 'mock-user-id',
  email: 'teste@gymtracker.com',
  name: 'Usuário Teste',
  role: 'user',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_TOKEN = 'mock-jwt-token-dev-only';

export async function mockLogin(): Promise<void> {
  await setAccessToken(MOCK_TOKEN);
}

export async function mockRegister(): Promise<void> {
  await setAccessToken(MOCK_TOKEN);
}
