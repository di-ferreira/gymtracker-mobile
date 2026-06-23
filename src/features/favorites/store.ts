import { create } from 'zustand';
import { getFavoriteIds, toggleFavorite as storageToggleFavorite } from '../../storage';

interface FavoritesState {
  ids: string[];
  isLoading: boolean;
  load: () => Promise<void>;
  toggle: (id: string) => Promise<boolean>;
  clear: () => Promise<void>;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: [],
  isLoading: true,

  load: async () => {
    const ids = await getFavoriteIds();
    set({ ids, isLoading: false });
  },

  toggle: async (id: string) => {
    const isNowFav = await storageToggleFavorite(id);
    const ids = await getFavoriteIds();
    set({ ids });
    return isNowFav;
  },

  clear: async () => {
    const { clearFavorites } = await import('../../storage');
    await clearFavorites();
    set({ ids: [] });
  },

  isFavorite: (id: string) => {
    return get().ids.includes(id);
  },
}));
