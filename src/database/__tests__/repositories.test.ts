import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = {
  runAsync: vi.fn(),
  getAllAsync: vi.fn(),
  getFirstAsync: vi.fn(),
};

vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: vi.fn(() => Promise.resolve(mockDb)),
  SQLiteProvider: ({ children }: any) => children,
  useSQLiteContext: vi.fn(() => mockDb),
}));

describe('ExerciseRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create repository with all methods', async () => {
    const { createExerciseRepository } = await import('../repositories/exercise-repository');
    const repo = createExerciseRepository(mockDb as any);
    expect(typeof repo.findAll).toBe('function');
    expect(typeof repo.findById).toBe('function');
    expect(typeof repo.search).toBe('function');
    expect(typeof repo.findByMuscleGroup).toBe('function');
    expect(typeof repo.upsert).toBe('function');
    expect(typeof repo.upsertBatch).toBe('function');
  });

  it('findAll should query non-deleted exercises ordered by name', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([
      { id: '1', name: 'Bench Press', slug: 'bench-press' },
    ]);
    const { createExerciseRepository } = await import('../repositories/exercise-repository');
    const repo = createExerciseRepository(mockDb as any);
    const result = await repo.findAll();
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM exercises WHERE deleted_at IS NULL ORDER BY name'
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bench Press');
  });

  it('findById should return null for non-existent exercise', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(null);
    const { createExerciseRepository } = await import('../repositories/exercise-repository');
    const repo = createExerciseRepository(mockDb as any);
    const result = await repo.findById('non-existent');
    expect(result).toBeNull();
  });
});

describe('WorkoutRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create repository with all methods', async () => {
    const { createWorkoutRepository } = await import('../repositories/workout-repository');
    const repo = createWorkoutRepository(mockDb as any);
    expect(typeof repo.findAll).toBe('function');
    expect(typeof repo.findById).toBe('function');
    expect(typeof repo.create).toBe('function');
    expect(typeof repo.update).toBe('function');
    expect(typeof repo.remove).toBe('function');
    expect(typeof repo.getExercises).toBe('function');
    expect(typeof repo.addExercise).toBe('function');
    expect(typeof repo.removeExercise).toBe('function');
    expect(typeof repo.reorderExercises).toBe('function');
  });

  it('should create a workout', async () => {
    const { createWorkoutRepository } = await import('../repositories/workout-repository');
    const repo = createWorkoutRepository(mockDb as any);
    await repo.create({ id: 'wo-1', name: 'Test Workout', description: null });
    expect(mockDb.runAsync).toHaveBeenCalled();
    const sql = (mockDb.runAsync.mock.calls[0] as string[])[0] as string;
    expect(sql).toContain('INSERT INTO workouts');
    expect(sql).toContain('name');
  });

  it('should add exercise to workout', async () => {
    const { createWorkoutRepository } = await import('../repositories/workout-repository');
    const repo = createWorkoutRepository(mockDb as any);
    await repo.addExercise({
      id: 'we-1',
      workout_id: 'wo-1',
      exercise_id: 'ex-1',
      exercise_order: 0,
    });
    expect(mockDb.runAsync).toHaveBeenCalled();
    const sql = (mockDb.runAsync.mock.calls[0] as string[])[0] as string;
    expect(sql).toContain('INSERT INTO workout_exercises');
  });

  it('should reorder exercises', async () => {
    const { createWorkoutRepository } = await import('../repositories/workout-repository');
    const repo = createWorkoutRepository(mockDb as any);
    await repo.reorderExercises('wo-1', ['we-1', 'we-2', 'we-3']);
    expect(mockDb.runAsync).toHaveBeenCalledTimes(3);
    expect(mockDb.runAsync.mock.calls[0][1]).toBe(0);
    expect(mockDb.runAsync.mock.calls[0][2]).toBe('we-1');
    expect(mockDb.runAsync.mock.calls[2][1]).toBe(2);
    expect(mockDb.runAsync.mock.calls[2][2]).toBe('we-3');
  });
});
