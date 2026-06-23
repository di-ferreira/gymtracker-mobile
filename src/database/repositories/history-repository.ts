import type { SQLiteDatabase } from 'expo-sqlite';

export interface WorkoutHistoryRow {
  id: string;
  workout_id: string;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  total_volume: number | null;
  notes: string | null;
  created_at: string;
}

export interface ExerciseProgressRow {
  id: string;
  workout_history_id: string;
  exercise_id: string;
  set_order: number;
  weight: number;
  reps: number;
  rpe: number | null;
  created_at: string;
}

export function createHistoryRepository(db: SQLiteDatabase) {
  async function findAll(): Promise<WorkoutHistoryRow[]> {
    return await db.getAllAsync<WorkoutHistoryRow>(
      'SELECT * FROM workout_history ORDER BY started_at DESC'
    );
  }

  async function findById(id: string): Promise<WorkoutHistoryRow | null> {
    return await db.getFirstAsync<WorkoutHistoryRow>(
      'SELECT * FROM workout_history WHERE id = ?',
      id
    );
  }

  async function create(data: Omit<WorkoutHistoryRow, 'created_at'>): Promise<void> {
    await db.runAsync(
      `INSERT INTO workout_history (id, workout_id, started_at, finished_at, duration_seconds, total_volume, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))`,
      data.id,
      data.workout_id,
      data.started_at,
      data.finished_at,
      data.duration_seconds,
      data.total_volume,
      data.notes
    );
  }

  async function finish(id: string, finishedAt: string, durationSeconds: number, totalVolume: number): Promise<void> {
    await db.runAsync(
      'UPDATE workout_history SET finished_at = ?, duration_seconds = ?, total_volume = ? WHERE id = ?',
      finishedAt,
      durationSeconds,
      totalVolume,
      id
    );
  }

  async function getRecent(limit: number = 10): Promise<WorkoutHistoryRow[]> {
    return await db.getAllAsync<WorkoutHistoryRow>(
      'SELECT * FROM workout_history WHERE finished_at IS NOT NULL ORDER BY started_at DESC LIMIT ?',
      limit
    );
  }

  async function getProgressForExercise(exerciseId: string): Promise<ExerciseProgressRow[]> {
    return await db.getAllAsync<ExerciseProgressRow>(
      `SELECT ep.* FROM exercise_progress ep
       JOIN workout_history wh ON wh.id = ep.workout_history_id
       WHERE ep.exercise_id = ? AND wh.finished_at IS NOT NULL
       ORDER BY wh.started_at ASC, ep.set_order ASC`,
      exerciseId
    );
  }

  async function saveSet(data: Omit<ExerciseProgressRow, 'created_at'>): Promise<void> {
    await db.runAsync(
      `INSERT INTO exercise_progress (id, workout_history_id, exercise_id, set_order, weight, reps, rpe, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))`,
      data.id,
      data.workout_history_id,
      data.exercise_id,
      data.set_order,
      data.weight,
      data.reps,
      data.rpe
    );
  }

  async function getTotalWorkouts(): Promise<number> {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM workout_history WHERE finished_at IS NOT NULL'
    );
    return result?.count ?? 0;
  }

  async function getTotalVolume(): Promise<number> {
    const result = await db.getFirstAsync<{ total: number | null }>(
      'SELECT COALESCE(SUM(total_volume), 0) as total FROM workout_history WHERE finished_at IS NOT NULL'
    );
    return result?.total ?? 0;
  }

  return { findAll, findById, create, finish, getRecent, getProgressForExercise, saveSet, getTotalWorkouts, getTotalVolume };
}
