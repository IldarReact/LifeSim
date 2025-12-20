import { describe, it, expect } from 'vitest';

import { calculateMaxLoanAmount, createDebt } from '../../loan-calculator';
import { createMockPlayer } from '../utils/mock-player';

describe('calculateMaxLoanAmount', () => {
  it('должен рассчитать максимальную сумму для ипотеки', () => {
    const player = createMockPlayer({ quarterlySalary: 300000 });
    const maxAmount = calculateMaxLoanAmount(player.quarterlySalary / 3, player.debts, 'mortgage');
    expect(maxAmount).toBeGreaterThan(0);
    expect(maxAmount).toBeLessThanOrEqual(100000 * 0.5 * 120);
  });

  it('должен рассчитать максимальную сумму для потребительского кредита', () => {
    const player = createMockPlayer({ quarterlySalary: 150000 });
    const maxAmount = calculateMaxLoanAmount(player.quarterlySalary / 3, player.debts, 'consumer_credit');
    expect(maxAmount).toBeGreaterThan(0);
    expect(maxAmount).toBeLessThanOrEqual(50000 * 0.5 * 24);
  });

  it('должен вернуть 0 если уже есть большая долговая нагрузка', () => {
    const player = createMockPlayer({
      quarterlySalary: 30000,
      debts: [createDebt(500000, 12, 40, 'mortgage', 'Ипотека', 1)],
    });
    expect(calculateMaxLoanAmount(player.quarterlySalary / 3, player.debts, 'consumer_credit')).toBe(0);
  });
});