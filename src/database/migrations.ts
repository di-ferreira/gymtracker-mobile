import type { SQLiteDatabase } from 'expo-sqlite';
import { CREATE_TABLES, CREATE_INDEXES } from './schema';

const MIGRATIONS: Array<{ version: number; name: string; sql: string }> = [
  {
    version: 1,
    name: 'initial_schema',
    sql: CREATE_TABLES + CREATE_INDEXES,
  },
  {
    version: 2,
    name: 'offline_exercises',
    sql: `CREATE TABLE IF NOT EXISTS offline_exercises (
      exercise_id TEXT PRIMARY KEY,
      synced_at TEXT NOT NULL,
      thumbnail_path TEXT,
      image_path TEXT,
      gif_path TEXT,
      video_path TEXT
    );`,
  },
  {
    version: 3,
    name: 'workout_user_id',
    sql: `ALTER TABLE workouts ADD COLUMN user_id TEXT NOT NULL DEFAULT '';`,
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );`
  );

  const currentVersion = await db.getFirstAsync<{ version: number }>(
    'SELECT COALESCE(MAX(version), 0) as version FROM _migrations'
  );

  const pending = MIGRATIONS.filter(m => m.version > (currentVersion?.version ?? 0));

  for (const migration of pending) {
    await db.execAsync(migration.sql);
    await db.runAsync(
      'INSERT INTO _migrations (version, name) VALUES (?, ?)',
      migration.version,
      migration.name
    );
  }
}
