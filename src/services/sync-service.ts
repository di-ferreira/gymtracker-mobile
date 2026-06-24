import { fetchExercises, fetchMuscleGroups, fetchMovementGroups, fetchEquipment } from './catalog-service';
import { createExerciseRepository } from '../database/repositories/exercise-repository';
import { createCatalogRepository } from '../database/repositories/catalog-repository';
import { getDatabase } from '../database';

async function clearCatalog(db: Awaited<ReturnType<typeof getDatabase>>): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys=OFF');
  await db.execAsync('DELETE FROM exercise_alternatives');
  await db.execAsync('DELETE FROM exercise_instructions');
  await db.execAsync('DELETE FROM exercise_equipments');
  await db.execAsync('DELETE FROM exercises');
  await db.execAsync('DELETE FROM equipments');
  await db.execAsync('DELETE FROM movement_groups');
  await db.execAsync('DELETE FROM muscle_groups');
  await db.execAsync('PRAGMA foreign_keys=ON');
}

export async function syncCatalog(): Promise<void> {
  const db = await getDatabase();
  const catalogRepo = createCatalogRepository(db);

  const [exercises, muscleGroups, movementGroups, equipment] = await Promise.all([
    fetchExercises(),
    fetchMuscleGroups(),
    fetchMovementGroups(),
    fetchEquipment(),
  ]);

  await clearCatalog(db);

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
        `INSERT INTO ${table} (${columns.join(', ')}, created_at, updated_at)
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
        deleted_at: null,
        created_at: ex.created_at,
        updated_at: ex.updated_at,
      })),
    );
  }

  await catalogRepo.setVersion({
    version_major: 1,
    version_minor: 0,
    checksum: '',
    status: 'synced',
    checksum_algorithm: 'none',
  });
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
    lastSync: version ? new Date().toISOString() : null,
  };
}
