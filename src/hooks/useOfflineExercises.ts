import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '../database';
import { createOfflineRepository } from '../database/repositories/offline-repository';
import { downloadExerciseMedia, removeExerciseMedia } from '../services/media-cache';
import { useExercise } from './useExercises';

const OFFLINE_QUERY_KEY = ['offline-exercises'];

async function getOfflineIds(): Promise<Set<string>> {
  const db = await getDatabase();
  const repo = createOfflineRepository(db);
  return repo.getAllIds();
}

export function useOfflineExercises() {
  return useQuery({
    queryKey: OFFLINE_QUERY_KEY,
    queryFn: getOfflineIds,
    staleTime: Infinity,
  });
}

export function useToggleOffline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ exerciseId, isCurrentlyOffline }: { exerciseId: string; isCurrentlyOffline: boolean }) => {
      const db = await getDatabase();
      const repo = createOfflineRepository(db);

      if (isCurrentlyOffline) {
        await removeExerciseMedia(exerciseId);
        await repo.remove(exerciseId);
      } else {
        const exercise = await queryClient.fetchQuery({
          queryKey: ['exercise', exerciseId],
        });
        const urls = (exercise as { thumbnail_url?: string | null; image_url?: string | null; gif_url?: string | null; video_url?: string | null }) ?? {};
        const paths = await downloadExerciseMedia(exerciseId, {
          thumbnail_url: urls.thumbnail_url,
          image_url: urls.image_url,
          gif_url: urls.gif_url,
          video_url: urls.video_url,
        });
        await repo.add(exerciseId, paths);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFLINE_QUERY_KEY });
    },
  });
}

export { useExercise };
