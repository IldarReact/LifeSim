import { describe, it, expect } from 'vitest';
import { createDebt } from '../../loan-calculator';

describe('createDebt', () => {
  it('должен создать объект кредита', () => {
    const debt = createDebt(100000, 12, 4, 'consumer_credit', 'Кредит на ремонт', 10);

    expect(debt.principalAmount).toBe(100000);
    expect(debt.remainingAmount).toBe(100000);
    expect(debt.interestRate).toBe(12);
    expect(debt.termQuarters).toBe(4);
    expect(debt.remainingQuarters).toBe(4);
    expect(debt.startTurn).toBe(10);
    expect(debt.type).toBe('consumer_credit');
    expect(debt.name).toBe('Кредит на ремонт');
    expect(debt.quarterlyPayment).toBeGreaterThan(0);
    expect(debt.id).toContain('debt_');
  });
});