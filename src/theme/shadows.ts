import { Platform } from 'react-native';

const iosShadow = (elevation: number) => {
  const shadows: Record<number, { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number }> = {
    0: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
    1: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2 },
    2: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
    3: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    4: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16 },
  };
  return shadows[elevation] ?? shadows[0];
};

const androidElevation: Record<number, number> = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 16,
};

export const shadows = Platform.select({
  ios: {
    none: iosShadow(0),
    sm: iosShadow(1),
    md: iosShadow(2),
    lg: iosShadow(3),
    xl: iosShadow(4),
  },
  default: {
    none: { elevation: androidElevation[0] },
    sm: { elevation: androidElevation[1] },
    md: { elevation: androidElevation[2] },
    lg: { elevation: androidElevation[3] },
    xl: { elevation: androidElevation[4] },
  },
}) as {
  none: Record<string, unknown>;
  sm: Record<string, unknown>;
  md: Record<string, unknown>;
  lg: Record<string, unknown>;
  xl: Record<string, unknown>;
};
