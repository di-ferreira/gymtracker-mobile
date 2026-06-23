import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'preferences-storage' });

const ONBOARDING_DONE_KEY = 'onboarding_done';
const WEIGHT_UNIT_KEY = 'weight_unit';
const REST_TIMER_DEFAULT_KEY = 'rest_timer_default';
const THEME_KEY = 'theme';

export type WeightUnit = 'kg' | 'lbs';
export type ThemeMode = 'dark' | 'light';

export function isOnboardingDone(): boolean {
  return storage.getBoolean(ONBOARDING_DONE_KEY) ?? false;
}

export function setOnboardingDone(): void {
  storage.set(ONBOARDING_DONE_KEY, true);
}

export function getWeightUnit(): WeightUnit {
  return (storage.getString(WEIGHT_UNIT_KEY) as WeightUnit) ?? 'kg';
}

export function setWeightUnit(unit: WeightUnit): void {
  storage.set(WEIGHT_UNIT_KEY, unit);
}

export function getDefaultRestTimer(): number {
  return storage.getNumber(REST_TIMER_DEFAULT_KEY) ?? 60;
}

export function setDefaultRestTimer(seconds: number): void {
  storage.set(REST_TIMER_DEFAULT_KEY, seconds);
}

export function getTheme(): ThemeMode {
  return (storage.getString(THEME_KEY) as ThemeMode) ?? 'dark';
}

export function setTheme(theme: ThemeMode): void {
  storage.set(THEME_KEY, theme);
}

export function clearAll(): void {
  storage.clearAll();
}
