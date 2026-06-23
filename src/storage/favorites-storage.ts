import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favorite_ids';

export async function getFavoriteIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function setFavoriteIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export async function isFavorite(id: string): Promise<boolean> {
  const ids = await getFavoriteIds();
  return ids.includes(id);
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const ids = await getFavoriteIds();
  const index = ids.indexOf(id);
  if (index >= 0) {
    ids.splice(index, 1);
    await setFavoriteIds(ids);
    return false;
  }
  ids.push(id);
  await setFavoriteIds(ids);
  return true;
}

export async function clearFavorites(): Promise<void> {
  await AsyncStorage.removeItem(FAVORITES_KEY);
}
