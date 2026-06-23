import { create } from 'zustand';
import { getDatabase } from '../../database';
import { createWorkoutRepository } from '../../database/repositories/workout-repository';
import { createHistoryRepository } from '../../database/repositories/history-repository';

interface SetEntry {
  set_order: number;
  weight: number;
  reps: number;
  rpe: number | null;
  completed: boolean;
}

interface ActiveExercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  sets: SetEntry[];
}

interface ActiveWorkoutState {
  workoutId: string | null;
  workoutName: string;
  exercises: ActiveExercise[];
  currentExerciseIndex: number;
  startedAt: string | null;
  historyId: string | null;
  isResting: boolean;
  restTime: number;
  isActive: boolean;

  startWorkout: (workoutId: string) => Promise<void>;
  completeSet: (setOrder: number, weight: number, reps: number, rpe?: number) => void;
  toggleSet: (setOrder: number) => void;
  setResting: (value: boolean) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  finishWorkout: () => Promise<{ historyId: string; duration: number; volume: number }>;
  addSet: () => void;
  getCurrentExercise: () => ActiveExercise | null;
  reset: () => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
  workoutId: null,
  workoutName: '',
  exercises: [],
  currentExerciseIndex: 0,
  startedAt: null,
  historyId: null,
  isResting: false,
  restTime: 60,
  isActive: false,

  startWorkout: async (workoutId) => {
    const db = await getDatabase();
    const repo = createWorkoutRepository(db);
    const workout = await repo.findById(workoutId);
    if (!workout) return;

    const workoutExercises = await repo.getExercises(workoutId);
    const ids = workoutExercises.map((we) => we.exercise_id);
    const placeholders = ids.map(() => '?').join(',');
    const rows = await db.getAllAsync<{ id: string; name: string }>(
      `SELECT id, name FROM exercises WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
      ...ids
    );

    const exercises: ActiveExercise[] = workoutExercises.map((we) => ({
      id: we.id,
      exercise_id: we.exercise_id,
      exercise_name: rows.find((r) => r.id === we.exercise_id)?.name ?? 'Exercício',
      sets: [{ set_order: 1, weight: 0, reps: 0, rpe: null, completed: false }],
    }));

    const historyRepo = createHistoryRepository(db);
    const historyId = `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    await historyRepo.create({
      id: historyId,
      workout_id: workoutId,
      started_at: now,
      finished_at: null,
      duration_seconds: null,
      total_volume: null,
      notes: null,
    });

    set({
      workoutId,
      workoutName: workout.name,
      exercises,
      currentExerciseIndex: 0,
      startedAt: now,
      historyId,
      isResting: false,
      isActive: true,
    });
  },

  completeSet: (setOrder, weight, reps, rpe) => {
    const state = get();
    const exercise = state.exercises[state.currentExerciseIndex];
    if (!exercise) return;

    const updatedSets = exercise.sets.map((s) =>
      s.set_order === setOrder
        ? { ...s, weight, reps, rpe: rpe ?? null, completed: true }
        : s
    );

    const updatedExercises = [...state.exercises];
    updatedExercises[state.currentExerciseIndex] = { ...exercise, sets: updatedSets };

    set({ exercises: updatedExercises, isResting: true });
  },

  toggleSet: (setOrder) => {
    const state = get();
    const exercise = state.exercises[state.currentExerciseIndex];
    if (!exercise) return;

    const updatedSets = exercise.sets.map((s) =>
      s.set_order === setOrder ? { ...s, completed: !s.completed } : s
    );

    const updatedExercises = [...state.exercises];
    updatedExercises[state.currentExerciseIndex] = { ...exercise, sets: updatedSets };

    set({ exercises: updatedExercises });
  },

  setResting: (value) => set({ isResting: value }),

  nextExercise: () => {
    const state = get();
    if (state.currentExerciseIndex < state.exercises.length - 1) {
      set({
        currentExerciseIndex: state.currentExerciseIndex + 1,
        isResting: false,
      });
    }
  },

  prevExercise: () => {
    const state = get();
    if (state.currentExerciseIndex > 0) {
      set({
        currentExerciseIndex: state.currentExerciseIndex - 1,
        isResting: false,
      });
    }
  },

  finishWorkout: async () => {
    const state = get();
    const db = await getDatabase();
    const historyRepo = createHistoryRepository(db);

    const now = new Date();
    const start = new Date(state.startedAt!);
    const durationSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);

    let totalVolume = 0;
    for (const exercise of state.exercises) {
      for (const set of exercise.sets) {
        if (set.completed) {
          totalVolume += set.weight * set.reps;
        }
      }
    }

    const finishedAt = now.toISOString();
    await historyRepo.finish(state.historyId!, finishedAt, durationSeconds, totalVolume);

    for (const exercise of state.exercises) {
      for (const set of exercise.sets) {
        if (set.completed) {
          await historyRepo.saveSet({
            id: `ep-${state.historyId}-${exercise.exercise_id}-${set.set_order}`,
            workout_history_id: state.historyId!,
            exercise_id: exercise.exercise_id,
            set_order: set.set_order,
            weight: set.weight,
            reps: set.reps,
            rpe: set.rpe,
          });
        }
      }
    }

    set({ isActive: false });

    return { historyId: state.historyId!, duration: durationSeconds, volume: totalVolume };
  },

  addSet: () => {
    const state = get();
    const exercise = state.exercises[state.currentExerciseIndex];
    if (!exercise) return;

    const newOrder = exercise.sets.length + 1;
    const updatedExercises = [...state.exercises];
    updatedExercises[state.currentExerciseIndex] = {
      ...exercise,
      sets: [...exercise.sets, { set_order: newOrder, weight: 0, reps: 0, rpe: null, completed: false }],
    };

    set({ exercises: updatedExercises });
  },

  getCurrentExercise: () => {
    const state = get();
    return state.exercises[state.currentExerciseIndex] ?? null;
  },

  reset: () => {
    set({
      workoutId: null,
      workoutName: '',
      exercises: [],
      currentExerciseIndex: 0,
      startedAt: null,
      historyId: null,
      isResting: false,
      restTime: 60,
      isActive: false,
    });
  },
}));
