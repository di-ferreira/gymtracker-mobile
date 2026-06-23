import type { SQLiteDatabase } from 'expo-sqlite';
import { fetchExercises, fetchMuscleGroups, fetchMovementGroups, fetchEquipment } from './catalog-service';
import { createExerciseRepository } from '../database/repositories/exercise-repository';
import { createCatalogRepository } from '../database/repositories/catalog-repository';
import { getDatabase } from '../database';

export async function syncCatalog(): Promise<void> {
  const db = await getDatabase();
  const catalogRepo = createCatalogRepository(db);

  const localVersion = await catalogRepo.getVersion();
  const remoteVersion = await fetchCatalogVersion();

  if (shouldSync(localVersion, remoteVersion)) {
    await downloadAndStoreCatalog(db, remoteVersion);
    await catalogRepo.setVersion(remoteVersion);
  }
}

async function fetchCatalogVersion(): Promise<{
  version_major: number;
  version_minor: number;
  checksum: string;
  status: string;
  checksum_algorithm: string;
}> {
  const { api } = await import('./api');
  const response = await api.get('/catalog/version');
  return response.data;
}

function shouldSync(
  local: { version_major: number; version_minor: number } | null,
  remote: { version_major: number; version_minor: number },
): boolean {
  if (!local) return true;
  if (remote.version_major > local.version_major) return true;
  if (remote.version_major === local.version_major && remote.version_minor > local.version_minor) return true;
  return false;
}

async function downloadAndStoreCatalog(
  db: SQLiteDatabase,
  _version: { version_major: number; version_minor: number },
): Promise<void> {
  const [exercises, muscleGroups, movementGroups, equipment] = await Promise.all([
    fetchExercises(),
    fetchMuscleGroups(),
    fetchMovementGroups(),
    fetchEquipment(),
  ]);

  const exerciseRepo = createExerciseRepository(db);

  const bulkUpsert = async <T extends Record<string, unknown>>(
    table: string,
    items: T[],
    columns: string[],
  ) => {
    for (const item of items) {
      const placeholders = columns.map(() => '?').join(', ');
      const values: (string | number | null)[] = columns.map((col) => {
        const val = item[col];
        if (val === undefined || val === null) return null;
        return String(val);
      });

      await db.runAsync(
        `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}, created_at, updated_at)
         VALUES (${placeholders}, datetime('now'), datetime('now'))`,
        ...values,
      );
    }
  };

  if (muscleGroups.length > 0) {
    await bulkUpsert('muscle_groups', muscleGroups as unknown as Record<string, unknown>[], ['id', 'name', 'slug', 'description', 'order_index']);
  }

  if (movementGroups.length > 0) {
    await bulkUpsert('movement_groups', movementGroups as unknown as Record<string, unknown>[], ['id', 'name', 'slug', 'description', 'order_index']);
  }

  if (equipment.length > 0) {
    await bulkUpsert('equipments', equipment as unknown as Record<string, unknown>[], ['id', 'name', 'slug', 'description', 'category', 'order_index']);
  }

  if (exercises.length > 0) {
    await exerciseRepo.upsertBatch(
      exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        slug: ex.slug,
        description: ex.description,
        execution_tips: ex.execution_tips,
        difficulty: ex.difficulty,
        target_muscle_primary: ex.target_muscle_primary,
        thumbnail_url: ex.thumbnail_url,
        image_url: ex.image_url,
        gif_url: ex.gif_url,
        video_url: ex.video_url,
        movement_group_id: ex.movement_group_id,
        muscle_group_id: ex.muscle_group_id,
        deleted_at: ex.deleted_at,
        created_at: ex.created_at,
        updated_at: ex.updated_at,
      })),
    );
  }
}

export async function getSyncStatus(): Promise<{
  localVersion: { version_major: number; version_minor: number } | null;
  lastSync: string | null;
}> {
  const db = await getDatabase();
  const catalogRepo = createCatalogRepository(db);
  const version = await catalogRepo.getVersion();
  return {
    localVersion: version,
    lastSync: null,
  };
}
