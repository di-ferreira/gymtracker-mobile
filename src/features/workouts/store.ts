import { create } from 'zustand';
import { getDatabase } from '../../database';
import { createWorkoutRepository } from '../../database/repositories/workout-repository';
import type { WorkoutRow } from '../../database/repositories/workout-repository';

export interface WorkoutWithExerciseCount extends WorkoutRow {
  exercise_count: number;
}

interface WorkoutsState {
  workouts: WorkoutWithExerciseCount[];
  isLoading: boolean;
  load: () => Promise<void>;
  create: (name: string, description?: string) => Promise<string>;
  update: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  addExercises: (workoutId: string, exerciseIds: string[]) => Promise<void>;
  removeExercise: (workoutId: string, exerciseId: string) => Promise<void>;
  reorderExercises: (workoutId: string, orderedExerciseIds: string[]) => Promise<void>;
}

export const useWorkoutsStore = create<WorkoutsState>((set, get) => ({
  workouts: [],
  isLoading: true,

  load: async () => {
    const db = await getDatabase();
    const repo = createWorkoutRepository(db);
    const rows = await repo.findAll();

    const workoutsWithCount: WorkoutWithExerciseCount[] = [];
    for (const w of rows) {
      const exercises = await repo.getExercises(w.id);
      workoutsWithCount.push({ ...w, exercise_count: exercises.length });
    }

    set({ workouts: workoutsWithCount, isLoading: false });
  },

  create: async (name, description) => {
    const db = await getDatabase();
    const repo = createWorkoutRepository(db);
    const id = `wo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await repo.create({ id, name, description: description ?? null });
    await get().load();
    return id;
  },

  update: async (id, data) => {
    const db = await getDatabase();
    const repo = createWorkoutRepository(db);
    await repo.update(id, data);
    await get().load();
  },

  remove: async (id) => {
    const db = await getDatabase();
    const repo = createWorkoutRepository(db);
    await repo.remove(id);
    await get().load();
  },

  addExercises: async (workoutId, exerciseIds) => {
    const db = await getDatabase();
    const repo = createWorkoutRepository(db);
    const existing = await repo.getExercises(workoutId);
    const nextOrder = existing.length;

    for (let i = 0; i < exerciseIds.length; i++) {
      await repo.addExercise({
        id: `we-${workoutId}-${exerciseIds[i]}`,
        workout_id: workoutId,
        exercise_id: exerciseIds[i],
        exercise_order: nextOrder + i,
      });
    }

    await get().load();
  },

  removeExercise: async (workoutId, exerciseId) => {
    const db = await getDatabase();
    const repo = createWorkoutRepository(db);
    const existing = await repo.getExercises(workoutId);
    const target = existing.find((e) => e.exercise_id === exerciseId);
    if (target) {
      await repo.removeExercise(target.id);
      const remaining = existing
        .filter((e) => e.exercise_id !== exerciseId)
        .map((e) => e.id);
      await repo.reorderExercises(workoutId, remaining);
    }
    await get().load();
  },

  reorderExercises: async (workoutId, orderedExerciseIds) => {
    const db = await getDatabase();
    const repo = createWorkoutRepository(db);
    await repo.reorderExercises(workoutId, orderedExerciseIds);
    await get().load();
  },
}));
