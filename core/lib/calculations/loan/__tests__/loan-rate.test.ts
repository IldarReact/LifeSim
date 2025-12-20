import { describe, it, expect } from 'vitest';

import { calculateLoanRate } from '../../loan-calculator';

describe('calculateLoanRate', () => {
  it('должен рассчитать ставку для ипотеки с хорошим рейтингом', () => {
    expect(calculateLoanRate(7, 'mortgage', 90)).toBeCloseTo(9.5, 1);
  });

  it('должен рассчитать ставку для потребительского кредита с плохим рейтингом', () => {
    expect(calculateLoanRate(7, 'consumer_credit', 50)).toBeCloseTo(14.5, 1);
  });

  it('должен рассчитать ставку для студенческого кредита', () => {
    expect(calculateLoanRate(7, 'student_loan', 70)).toBeCloseTo(9.5, 1);
  });
});