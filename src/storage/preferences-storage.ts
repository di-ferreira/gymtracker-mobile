import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_DONE_KEY = 'onboarding_done';
const WEIGHT_UNIT_KEY = 'weight_unit';
const REST_TIMER_DEFAULT_KEY = 'rest_timer_default';
const THEME_KEY = 'theme';
const API_URL_KEY = 'api_url';

export type WeightUnit = 'kg' | 'lbs';
export type ThemeMode = 'dark' | 'light';

export async function isOnboardingDone(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_DONE_KEY);
  return value === 'true';
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');
}

export async function getWeightUnit(): Promise<WeightUnit> {
  const value = await AsyncStorage.getItem(WEIGHT_UNIT_KEY);
  return (value as WeightUnit) ?? 'kg';
}

export async function setWeightUnit(unit: WeightUnit): Promise<void> {
  await AsyncStorage.setItem(WEIGHT_UNIT_KEY, unit);
}

export async function getDefaultRestTimer(): Promise<number> {
  const value = await AsyncStorage.getItem(REST_TIMER_DEFAULT_KEY);
  return value ? Number(value) : 60;
}

export async function setDefaultRestTimer(seconds: number): Promise<void> {
  await AsyncStorage.setItem(REST_TIMER_DEFAULT_KEY, String(seconds));
}

export async function getTheme(): Promise<ThemeMode> {
  const value = await AsyncStorage.getItem(THEME_KEY);
  return (value as ThemeMode) ?? 'dark';
}

export async function setTheme(theme: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, theme);
}

export async function getApiUrl(): Promise<string> {
  const value = await AsyncStorage.getItem(API_URL_KEY);
  return value ?? 'http://localhost:8000';
}

export async function setApiUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(API_URL_KEY, url);
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([
    ONBOARDING_DONE_KEY,
    WEIGHT_UNIT_KEY,
    REST_TIMER_DEFAULT_KEY,
    THEME_KEY,
    API_URL_KEY,
  ]);
}
