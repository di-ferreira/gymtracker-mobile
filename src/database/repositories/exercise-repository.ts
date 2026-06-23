import type { SQLiteDatabase } from 'expo-sqlite';

export interface ExerciseRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  execution_tips: string | null;
  difficulty: string | null;
  target_muscle_primary: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  gif_url: string | null;
  video_url: string | null;
  movement_group_id: string;
  muscle_group_id: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export function createExerciseRepository(db: SQLiteDatabase) {
  async function findAll(): Promise<ExerciseRow[]> {
    return await db.getAllAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE deleted_at IS NULL ORDER BY name'
    );
  }

  async function findById(id: string): Promise<ExerciseRow | null> {
    return await db.getFirstAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE id = ? AND deleted_at IS NULL',
      id
    );
  }

  async function search(query: string): Promise<ExerciseRow[]> {
    return await db.getAllAsync<ExerciseRow>(
      "SELECT * FROM exercises WHERE deleted_at IS NULL AND (name LIKE ? OR description LIKE ?) ORDER BY name",
      `%${query}%`,
      `%${query}%`
    );
  }

  async function findByMuscleGroup(muscleGroupId: string): Promise<ExerciseRow[]> {
    return await db.getAllAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE muscle_group_id = ? AND deleted_at IS NULL ORDER BY name',
      muscleGroupId
    );
  }

  async function findByMovementGroup(movementGroupId: string): Promise<ExerciseRow[]> {
    return await db.getAllAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE movement_group_id = ? AND deleted_at IS NULL ORDER BY name',
      movementGroupId
    );
  }

  async function upsert(exercise: ExerciseRow): Promise<void> {
    await db.runAsync(
      `INSERT OR REPLACE INTO exercises (id, name, slug, description, execution_tips, difficulty,
        target_muscle_primary, thumbnail_url, image_url, gif_url, video_url,
        movement_group_id, muscle_group_id, deleted_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      exercise.id,
      exercise.name,
      exercise.slug,
      exercise.description,
      exercise.execution_tips,
      exercise.difficulty,
      exercise.target_muscle_primary,
      exercise.thumbnail_url,
      exercise.image_url,
      exercise.gif_url,
      exercise.video_url,
      exercise.movement_group_id,
      exercise.muscle_group_id,
      exercise.deleted_at,
      exercise.created_at,
      exercise.updated_at
    );
  }

  async function upsertBatch(exercises: ExerciseRow[]): Promise<void> {
    for (const exercise of exercises) {
      await upsert(exercise);
    }
  }

  return { findAll, findById, search, findByMuscleGroup, findByMovementGroup, upsert, upsertBatch };
}
