import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
import { runSeed } from './seed';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('gymtracker.db');
    await runMigrations(db);
    await runSeed(db);
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
