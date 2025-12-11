import type { Stats, StatEffect } from '../types/stats.types';

export function applyStats<T extends Partial<Stats>>(
  base: T,
  effect: StatEffect
): T {
  const result = { ...base };

  (Object.keys(effect) as Array<keyof StatEffect>).forEach((key) => {
    if (key in result && typeof result[key] === 'number') {
      (result as any)[key] = (result[key] as number) + (effect[key] || 0);
    }
  });

  return result;
}
