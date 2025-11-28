import { describe, it, expect } from 'vitest';
import { createDebt, processDebtPayment } from '../../loan-calculator';

describe('processDebtPayment', () => {
  it('должен обработать платеж по кредиту', () => {
    const debt = createDebt(100000, 12, 4, 'consumer_credit', 'Тест', 1);
    const updatedDebt = processDebtPayment(debt);

    expect(updatedDebt.remainingQuarters).toBe(3);
    expect(updatedDebt.remainingAmount).toBeLessThan(100000);
    expect(updatedDebt.remainingAmount).toBeGreaterThan(0);
  });

  it('не должен изменять погашенный кредит', () => {
    const debt = {
      ...createDebt(100000, 12, 4, 'consumer_credit', 'Тест', 1),
      remainingAmount: 0,
      remainingQuarters: 0,
    };
    const updatedDebt = processDebtPayment(debt);
    expect(updatedDebt).toEqual(debt);
  });
});