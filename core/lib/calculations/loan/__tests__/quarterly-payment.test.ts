import { describe, it, expect } from 'vitest';

import { calculateQuarterlyPayment } from '../../loan-calculator';

describe('calculateQuarterlyPayment', () => {
  it('должен рассчитать квартальный платеж для кредита на 100000 под 12% на 4 квартала', () => {
    const payment = calculateQuarterlyPayment(100000, 12, 4);
    expect(payment).toBeGreaterThan(25000);
    expect(payment).toBeLessThan(27000);
  });

  it('должен вернуть 0 для нулевой суммы', () => {
    expect(calculateQuarterlyPayment(0, 12, 4)).toBe(0);
  });

  it('должен вернуть 0 для нулевого срока', () => {
    expect(calculateQuarterlyPayment(100000, 12, 0)).toBe(0);
  });

  it('должен рассчитать платеж для нулевой ставки', () => {
    expect(calculateQuarterlyPayment(100000, 0, 4)).toBe(25000);
  });
});