import { describe, it, expect } from 'vitest';

import { calculateEarlyRepayment, createDebt, processEarlyRepayment } from '../../loan-calculator';

describe('calculateEarlyRepayment & processEarlyRepayment', () => {
  it('должен вернуть оставшуюся сумму долга', () => {
    const debt = createDebt(100000, 12, 4, 'consumer_credit', 'Тест', 1);
    expect(calculateEarlyRepayment(debt)).toBe(100000);
  });

  it('должен полностью погасить кредит при полном досрочном погашении', () => {
    const debt = createDebt(100000, 12, 4, 'consumer_credit', 'Тест', 1);
    const updated = processEarlyRepayment(debt, 100000);
    expect(updated.remainingAmount).toBe(0);
    expect(updated.remainingQuarters).toBe(0);
  });

  it('должен частично погасить кредит и пересчитать платеж', () => {
    const debt = createDebt(100000, 12, 4, 'consumer_credit', 'Тест', 1);
    const updated = processEarlyRepayment(debt, 50000);
    expect(updated.remainingAmount).toBe(50000);
    expect(updated.remainingQuarters).toBe(4);
    expect(updated.quarterlyPayment).toBeLessThan(debt.quarterlyPayment);
  });
});