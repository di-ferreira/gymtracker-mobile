import { useQuery } from '@tanstack/react-query';
import { getDatabase } from '../database';

export interface MuscleGroupRow {
  id: string;
  name: string;
  slug: string;
}

export function useMuscleGroups() {
  return useQuery({
    queryKey: ['muscle-groups'],
    queryFn: async () => {
      const db = await getDatabase();
      return db.getAllAsync<MuscleGroupRow>(
        'SELECT id, name, slug FROM muscle_groups ORDER BY order_index, name'
      );
    },
    staleTime: Infinity,
  });
}
