import { create } from 'zustand';
import { getDatabase } from '../../database';
import { createWorkoutRepository } from '../../database/repositories/workout-repository';
import type { WorkoutRow } from '../../database/repositories/workout-repository';
import { useAuthStore } from '../auth/store';
import {
  createWorkoutOnApi,
  updateWorkoutOnApi,
  deleteWorkoutOnApi,
  addExerciseToWorkoutApi,
  removeExerciseFromWorkoutApi,
  reorderWorkoutExercisesApi,
} from '../../services/workout-service';

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
    const user = useAuthStore.getState().user;
    const rows = await repo.findAll(user?.id);

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
    const user = useAuthStore.getState().user;
    const id = `wo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await repo.create({ id, name, description: description ?? null, user_id: user?.id ?? '' });
    await get().load();

    try {
      await createWorkoutOnApi({ name, description });
    } catch {
      // Silently fail — local data exists and can be synced later
    }

    return id;
  },

  update: async (id, data) => {
    const db = await getDatabase();
    const repo = createWorkoutRepository(db);
    await repo.update(id, data);
    await get().load();

    try {
      await updateWorkoutOnApi(id, data);
    } catch {
      // Silently fail
    }
  },

  remove: async (id) => {
    const db = await getDatabase();
    const repo = createWorkoutRepository(db);
    await repo.remove(id);
    await get().load();

    try {
      await deleteWorkoutOnApi(id);
    } catch {
      // Silently fail
    }
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

    try {
      for (let i = 0; i < exerciseIds.length; i++) {
        await addExerciseToWorkoutApi(workoutId, {
          exercise_id: exerciseIds[i],
          sort_order: nextOrder + i,
        });
      }
    } catch {
      // Silently fail
    }
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
      await get().load();

      try {
        await removeExerciseFromWorkoutApi(workoutId, exerciseId);
      } catch {
        // Silently fail
      }
    }
  },

  reorderExercises: async (workoutId, orderedExerciseIds) => {
    const db = await getDatabase();
    const repo = createWorkoutRepository(db);
    await repo.reorderExercises(workoutId, orderedExerciseIds);
    await get().load();

    try {
      await reorderWorkoutExercisesApi(workoutId, orderedExerciseIds);
    } catch {
      // Silently fail
    }
  },
}));
