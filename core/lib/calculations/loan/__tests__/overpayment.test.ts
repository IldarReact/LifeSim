import { describe, it, expect } from 'vitest';
import { calculateOverpayment } from '../../loan-calculator';

describe('calculateOverpayment', () => {
  it('должен рассчитать переплату', () => {
    expect(calculateOverpayment(104000, 100000)).toBe(4000);
  });
});