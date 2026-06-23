import type { SQLiteDatabase } from 'expo-sqlite';

export interface WorkoutRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExerciseRow {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_order: number;
  created_at: string;
}

export function createWorkoutRepository(db: SQLiteDatabase) {
  async function findAll(): Promise<WorkoutRow[]> {
    return await db.getAllAsync<WorkoutRow>(
      'SELECT * FROM workouts ORDER BY created_at DESC'
    );
  }

  async function findById(id: string): Promise<WorkoutRow | null> {
    return await db.getFirstAsync<WorkoutRow>(
      'SELECT * FROM workouts WHERE id = ?',
      id
    );
  }

  async function create(data: Omit<WorkoutRow, 'created_at' | 'updated_at'>): Promise<void> {
    await db.runAsync(
      'INSERT INTO workouts (id, name, description, created_at, updated_at) VALUES (?, ?, ?, datetime("now"), datetime("now"))',
      data.id,
      data.name,
      data.description
    );
  }

  async function update(id: string, data: Partial<Pick<WorkoutRow, 'name' | 'description'>>): Promise<void> {
    const sets: string[] = [];
    const params: (string | null)[] = [];

    if (data.name !== undefined) {
      sets.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      sets.push('description = ?');
      params.push(data.description);
    }

    if (sets.length > 0) {
      sets.push('updated_at = datetime("now")');
      params.push(id);
      await db.runAsync(
        `UPDATE workouts SET ${sets.join(', ')} WHERE id = ?`,
        ...params
      );
    }
  }

  async function remove(id: string): Promise<void> {
    await db.runAsync('DELETE FROM workouts WHERE id = ?', id);
  }

  async function getExercises(workoutId: string): Promise<WorkoutExerciseRow[]> {
    return await db.getAllAsync<WorkoutExerciseRow>(
      'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY exercise_order',
      workoutId
    );
  }

  async function addExercise(data: Omit<WorkoutExerciseRow, 'created_at'>): Promise<void> {
    await db.runAsync(
      'INSERT INTO workout_exercises (id, workout_id, exercise_id, exercise_order, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      data.id,
      data.workout_id,
      data.exercise_id,
      data.exercise_order
    );
  }

  async function removeExercise(id: string): Promise<void> {
    await db.runAsync('DELETE FROM workout_exercises WHERE id = ?', id);
  }

  async function reorderExercises(workoutId: string, exerciseIds: string[]): Promise<void> {
    for (let i = 0; i < exerciseIds.length; i++) {
      await db.runAsync(
        'UPDATE workout_exercises SET exercise_order = ? WHERE id = ? AND workout_id = ?',
        i,
        exerciseIds[i],
        workoutId
      );
    }
  }

  return { findAll, findById, create, update, remove, getExercises, addExercise, removeExercise, reorderExercises };
}
