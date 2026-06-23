import type { SQLiteDatabase } from 'expo-sqlite';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export function createUserRepository(db: SQLiteDatabase) {
  async function save(user: UserRow): Promise<void> {
    await db.runAsync(
      `INSERT OR REPLACE INTO users (id, email, name, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      user.id,
      user.email,
      user.name,
      user.role,
      user.is_active,
      user.created_at,
      user.updated_at
    );
  }

  async function get(): Promise<UserRow | null> {
    return await db.getFirstAsync<UserRow>('SELECT * FROM users LIMIT 1');
  }

  async function clear(): Promise<void> {
    await db.runAsync('DELETE FROM users');
  }

  return { save, get, clear };
}
