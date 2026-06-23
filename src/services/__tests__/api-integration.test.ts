import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockApi = {
  post: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
};

vi.mock('../api', () => ({
  api: mockApi,
  refreshBaseUrl: vi.fn(),
  getBaseUrl: vi.fn(() => Promise.resolve('http://localhost:8000')),
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register user', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { id: 'uuid-1', email: 'test@test.com', name: 'Test', role: 'user', is_active: true, created_at: '2024-01-01T00:00:00Z' },
    });

    const { register } = await import('../auth-service');
    const result = await register({ email: 'test@test.com', password: 'password123', name: 'Test' });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
      email: 'test@test.com',
      password: 'password123',
      name: 'Test',
    });
    expect(result.email).toBe('test@test.com');
  });

  it('should login and set access token', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { access_token: 'jwt-token', token_type: 'bearer' },
    });

    const { login } = await import('../auth-service');
    await login({ email: 'test@test.com', password: 'password123' });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      password: 'password123',
    });
  });

  it('should get current user', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { id: 'uuid-1', email: 'test@test.com', name: 'Test', role: 'user', is_active: true, created_at: '2024-01-01T00:00:00Z' },
    });

    const { getMe } = await import('../auth-service');
    const result = await getMe();

    expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
    expect(result.email).toBe('test@test.com');
  });

  it('should update profile', async () => {
    mockApi.patch.mockResolvedValueOnce({
      data: { id: 'uuid-1', email: 'test@test.com', name: 'Updated Name', role: 'user', is_active: true, created_at: '2024-01-01T00:00:00Z' },
    });

    const { updateProfile } = await import('../auth-service');
    const result = await updateProfile({ name: 'Updated Name' });

    expect(mockApi.patch).toHaveBeenCalledWith('/auth/me', { name: 'Updated Name' });
    expect(result.name).toBe('Updated Name');
  });
});

describe('CatalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch exercises list', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: [
        { id: 'ex-1', name: 'Supino', slug: 'supino', movement_group_id: 'mg-1', muscle_group_id: 'ms-1', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      ],
    });

    const { fetchExercises } = await import('../catalog-service');
    const result = await fetchExercises();

    expect(mockApi.get).toHaveBeenCalledWith('/catalog/exercises/');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Supino');
  });

  it('should fetch muscle groups', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: [
        { id: 'ms-1', name: 'Peitoral', order_index: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      ],
    });

    const { fetchMuscleGroups } = await import('../catalog-service');
    const result = await fetchMuscleGroups();

    expect(mockApi.get).toHaveBeenCalledWith('/catalog/muscle-groups/');
    expect(result[0].name).toBe('Peitoral');
  });

  it('should fetch movement groups', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: [
        { id: 'mv-1', name: 'Compound', order_index: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      ],
    });

    const { fetchMovementGroups } = await import('../catalog-service');
    const result = await fetchMovementGroups();

    expect(mockApi.get).toHaveBeenCalledWith('/catalog/movement-groups/');
    expect(result[0].name).toBe('Compound');
  });

  it('should fetch equipment', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: [
        { id: 'eq-1', name: 'Barra', category: 'Free Weights', order_index: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      ],
    });

    const { fetchEquipment } = await import('../catalog-service');
    const result = await fetchEquipment();

    expect(mockApi.get).toHaveBeenCalledWith('/catalog/equipment/');
    expect(result[0].name).toBe('Barra');
  });
});
