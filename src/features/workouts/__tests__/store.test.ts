import { describe, it, expect, vi } from 'vitest';

vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: vi.fn(),
  SQLiteProvider: ({ children }: any) => children,
  useSQLiteContext: vi.fn(() => ({
    runAsync: vi.fn(),
    getAllAsync: vi.fn(),
    getFirstAsync: vi.fn(),
  })),
}));

vi.mock('../../../database', () => ({
  getDatabase: vi.fn(),
}));

vi.mock('../../../database/repositories/workout-repository', () => ({
  createWorkoutRepository: vi.fn(() => ({
    getAll: vi.fn(() => Promise.resolve([])),
    getById: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    addExercises: vi.fn(),
    removeExercise: vi.fn(),
    reorderExercises: vi.fn(),
  })),
}));

describe('WorkoutsStore', () => {
  it('should have initial state', async () => {
    const { useWorkoutsStore } = await import('../store');
    const state = useWorkoutsStore.getState();
    expect(state.workouts).toEqual([]);
    expect(state.isLoading).toBe(true);
  });

  it('should define all actions', async () => {
    const { useWorkoutsStore } = await import('../store');
    const state = useWorkoutsStore.getState();
    expect(typeof state.load).toBe('function');
    expect(typeof state.create).toBe('function');
    expect(typeof state.update).toBe('function');
    expect(typeof state.remove).toBe('function');
    expect(typeof state.addExercises).toBe('function');
    expect(typeof state.removeExercise).toBe('function');
    expect(typeof state.reorderExercises).toBe('function');
  });
});
