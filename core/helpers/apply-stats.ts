import type { Stats, StatEffect } from '../types/stats.types';

export function applyStats<T extends Partial<Stats>>(
  base: T,
  effect: StatEffect
): T {
  const result = { ...base };

  (Object.keys(effect) as Array<keyof StatEffect>).forEach((key) => {
    const k = key as keyof T;
    const currentVal = result[k];
    if (typeof currentVal === 'number') {
      result[k] = (currentVal + (effect[key] || 0)) as T[keyof T];
    }
  });

  return result;
}
