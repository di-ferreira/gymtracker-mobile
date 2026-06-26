import { useQuery } from '@tanstack/react-query';
import { getDatabase } from '../database';

export interface EquipmentRow {
  id: string;
  name: string;
  slug: string;
  category: string | null;
}

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const db = await getDatabase();
      return db.getAllAsync<EquipmentRow>(
        'SELECT id, name, slug, category FROM equipments ORDER BY name'
      );
    },
    staleTime: Infinity,
  });
}

export function useExerciseEquipmentMap() {
  return useQuery({
    queryKey: ['exercise-equipment-map'],
    queryFn: async () => {
      const db = await getDatabase();
      const rows = await db.getAllAsync<{ exercise_id: string; equipment_id: string }>(
        'SELECT exercise_id, equipment_id FROM exercise_equipments'
      );
      const map = new Map<string, string[]>();
      for (const row of rows) {
        const list = map.get(row.exercise_id) ?? [];
        list.push(row.equipment_id);
        map.set(row.exercise_id, list);
      }
      return map;
    },
    staleTime: Infinity,
  });
}
