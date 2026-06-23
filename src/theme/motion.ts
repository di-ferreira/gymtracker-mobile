export const motion = {
  duration: {
    instant: 0,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 500,
  } as const,
  ease: {
    standard: [0.25, 0.1, 0.25, 1] as const,
    decelerate: [0, 0, 0.2, 1] as const,
    accelerate: [0.4, 0, 1, 1] as const,
    spring: [0.34, 1.56, 0.64, 1] as const,
    sharp: [0.4, 0, 0.6, 1] as const,
  } as const,
} as const;
