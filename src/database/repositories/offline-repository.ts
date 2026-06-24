import type { SQLiteDatabase } from 'expo-sqlite';

export interface OfflineExerciseRow {
  exercise_id: string;
  synced_at: string;
  thumbnail_path: string | null;
  image_path: string | null;
  gif_path: string | null;
  video_path: string | null;
}

export function createOfflineRepository(db: SQLiteDatabase) {
  async function getAllIds(): Promise<Set<string>> {
    const rows = await db.getAllAsync<{ exercise_id: string }>(
      'SELECT exercise_id FROM offline_exercises'
    );
    return new Set(rows.map((r) => r.exercise_id));
  }

  async function get(exerciseId: string): Promise<OfflineExerciseRow | null> {
    return db.getFirstAsync<OfflineExerciseRow>(
      'SELECT * FROM offline_exercises WHERE exercise_id = ?',
      exerciseId
    );
  }

  async function exists(exerciseId: string): Promise<boolean> {
    const row = await db.getFirstAsync<{ c: number }>(
      'SELECT 1 as c FROM offline_exercises WHERE exercise_id = ?',
      exerciseId
    );
    return row !== null;
  }

  async function add(
    exerciseId: string,
    paths: {
      thumbnail_path?: string | null;
      image_path?: string | null;
      gif_path?: string | null;
      video_path?: string | null;
    },
  ): Promise<void> {
    await db.runAsync(
      `INSERT OR REPLACE INTO offline_exercises
        (exercise_id, synced_at, thumbnail_path, image_path, gif_path, video_path)
       VALUES (?, datetime('now'), ?, ?, ?, ?)`,
      exerciseId,
      paths.thumbnail_path ?? null,
      paths.image_path ?? null,
      paths.gif_path ?? null,
      paths.video_path ?? null,
    );
  }

  async function remove(exerciseId: string): Promise<void> {
    await db.runAsync(
      'DELETE FROM offline_exercises WHERE exercise_id = ?',
      exerciseId
    );
  }

  async function clearAll(): Promise<void> {
    await db.execAsync('DELETE FROM offline_exercises');
  }

  return { getAllIds, get, exists, add, remove, clearAll };
}
