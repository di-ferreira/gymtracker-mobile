import type { SQLiteDatabase } from 'expo-sqlite';

export function createCatalogRepository(db: SQLiteDatabase) {
  async function getVersion(): Promise<{ version_major: number; version_minor: number } | null> {
    return await db.getFirstAsync<{ version_major: number; version_minor: number }>(
      'SELECT version_major, version_minor FROM catalog_versions ORDER BY version_major DESC, version_minor DESC LIMIT 1'
    );
  }

  async function setVersion(version: { version_major: number; version_minor: number; checksum: string; status: string; checksum_algorithm: string }): Promise<void> {
    const id = `${version.version_major}.${version.version_minor}`;
    await db.runAsync(
      `INSERT OR REPLACE INTO catalog_versions (id, version_major, version_minor, checksum, status, checksum_algorithm, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))`,
      id,
      version.version_major,
      version.version_minor,
      version.checksum,
      version.status,
      version.checksum_algorithm
    );
  }

  return { getVersion, setVersion };
}
