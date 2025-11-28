import { describe, it, expect } from 'vitest';
import { createMockPlayer } from '../utils/mock-player';
import { canTakeLoan, createDebt } from '../../loan-calculator';

describe('canTakeLoan', () => {
  it('должен разрешить взять кредит при хороших условиях', () => {
    const player = createMockPlayer({ quarterlySalary: 300000, cash: 50000 });
    expect(canTakeLoan(player, 500000, 'mortgage')).toBe(true);
  });

  it('должен запретить взять слишком большой кредит', () => {
    const player = createMockPlayer({ quarterlySalary: 90000, cash: 10000 });
    expect(canTakeLoan(player, 10000000, 'mortgage')).toBe(false);
  });

  it('должен запретить взять кредит при низком рейтинге', () => {
    const player = createMockPlayer({
      quarterlySalary: 90000,
      cash: 1000,
      debts: Array(4).fill(null).map((_, i) =>
        createDebt(100000, 12, 4, 'consumer_credit', `Кредит ${i + 1}`, 1)
      ),
    });
    expect(canTakeLoan(player, 50000, 'consumer_credit')).toBe(false);
  });
});