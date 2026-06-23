import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'favorites-storage' });

const FAVORITES_KEY = 'favorite_ids';

export function getFavoriteIds(): string[] {
  const raw = storage.getString(FAVORITES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setFavoriteIds(ids: string[]): void {
  storage.set(FAVORITES_KEY, JSON.stringify(ids));
}

export function isFavorite(id: string): boolean {
  return getFavoriteIds().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const ids = getFavoriteIds();
  const index = ids.indexOf(id);
  if (index >= 0) {
    ids.splice(index, 1);
    setFavoriteIds(ids);
    return false;
  }
  ids.push(id);
  setFavoriteIds(ids);
  return true;
}

export function clearFavorites(): void {
  storage.remove(FAVORITES_KEY);
}
