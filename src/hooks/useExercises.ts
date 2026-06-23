import { useQuery } from '@tanstack/react-query';
import { getDatabase } from '../database';
import { createExerciseRepository } from '../database/repositories/exercise-repository';

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const db = await getDatabase();
      const repo = createExerciseRepository(db);
      return repo.findAll();
    },
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: async () => {
      const db = await getDatabase();
      const repo = createExerciseRepository(db);

      const exercise = await repo.findById(id);
      if (!exercise) return null;

      const muscleGroup = await db.getFirstAsync<{ id: string; name: string; slug: string }>(
        'SELECT id, name, slug FROM muscle_groups WHERE id = ?',
        exercise.muscle_group_id
      );

      const movementGroup = await db.getFirstAsync<{ id: string; name: string; slug: string }>(
        'SELECT id, name, slug FROM movement_groups WHERE id = ?',
        exercise.movement_group_id
      );

      const equipment = await db.getAllAsync<{ id: string; name: string; slug: string; category: string | null }>(
        `SELECT e.id, e.name, e.slug, e.category
         FROM equipments e
         JOIN exercise_equipments ee ON ee.equipment_id = e.id
         WHERE ee.exercise_id = ?`,
        id
      );

      const instructions = await db.getAllAsync<{ step_order: number; description: string }>(
        'SELECT step_order, description FROM exercise_instructions WHERE exercise_id = ? ORDER BY step_order',
        id
      );

      const alternatives = await db.getAllAsync<{ id: string; alternative_exercise_id: string; reason: string | null }>(
        'SELECT id, alternative_exercise_id, reason FROM exercise_alternatives WHERE exercise_id = ?',
        id
      );

      const alternativeNames = alternatives.length > 0
        ? await db.getAllAsync<{ id: string; name: string }>(
            `SELECT id, name FROM exercises WHERE id IN (${alternatives.map(() => '?').join(',')})`,
            ...alternatives.map((a) => a.alternative_exercise_id)
          )
        : [];

      return {
        ...exercise,
        muscle_group: muscleGroup ?? null,
        movement_group: movementGroup ?? null,
        equipment,
        instructions,
        alternatives: alternatives.map((a) => ({
          ...a,
          alternative_name: alternativeNames.find((n) => n.id === a.alternative_exercise_id)?.name ?? '',
        })),
      };
    },
    enabled: !!id,
  });
}

export type ExerciseDetail = Awaited<ReturnType<typeof useExercise>['data']>;
