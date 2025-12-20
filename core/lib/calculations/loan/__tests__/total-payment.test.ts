import { describe, it, expect } from 'vitest';

import { calculateTotalPayment } from '../../loan-calculator';

describe('calculateTotalPayment', () => {
  it('должен рассчитать общую сумму выплат', () => {
    expect(calculateTotalPayment(26000, 4)).toBe(104000);
  });
});