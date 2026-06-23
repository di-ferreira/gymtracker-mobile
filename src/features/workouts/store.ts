import { create } from 'zustand';
import { getDatabase } from '../../database';
import { createWorkoutRepository } from '../../database/repositories/workout-repository';
import type { WorkoutRow } from '../../database/repositories/workout-repository';

interface WorkoutWithExerciseCount extends WorkoutRow {
  exercise_count: number;
}

interface WorkoutsState {
  workouts: WorkoutWithExerciseCount[];
  isLoading: boolean;
  load: () => Promise<void>;
  create: (name: string, description?: string) => Promise<string>;
  update: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  remove: (id: string) => Promise<void>;
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
}));
