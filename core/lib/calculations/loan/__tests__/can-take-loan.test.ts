import { describe, it, expect } from 'vitest';
import { createMockPlayer } from '../utils/mock-player';
import { canTakeLoan, createDebt } from '../../loan-calculator';

describe('canTakeLoan', () => {
  it('должен разрешить взять кредит при хороших условиях', () => {
    const player = createMockPlayer({ quarterlySalary: 300000, stats: { money: 50000, happiness: 100, energy: 100, health: 100, sanity: 100, intelligence: 100 } });
    expect(canTakeLoan({
      amount: 500000,
      debtType: 'mortgage',
      cash: player.stats.money,
      monthlyIncome: player.quarterlySalary / 3,
      activeDebts: player.debts
    })).toBe(true);
  });

  it('должен запретить взять слишком большой кредит', () => {
    const player = createMockPlayer({ quarterlySalary: 90000, stats: { money: 10000, happiness: 100, energy: 100, health: 100, sanity: 100, intelligence: 100 } });
    expect(canTakeLoan({
      amount: 10000000,
      debtType: 'mortgage',
      cash: player.stats.money,
      monthlyIncome: player.quarterlySalary / 3,
      activeDebts: player.debts
    })).toBe(false);
  });

  it('должен запретить взять кредит при низком рейтинге', () => {
    const player = createMockPlayer({
      quarterlySalary: 90000,
      stats: { money: 1000, happiness: 100, energy: 100, health: 100, sanity: 100, intelligence: 100 },
      debts: Array(4).fill(null).map((_, i) =>
        createDebt(100000, 12, 4, 'consumer_credit', `Кредит ${i + 1}`, 1)
      ),
    });
    expect(canTakeLoan({
      amount: 50000,
      debtType: 'consumer_credit',
      cash: player.stats.money,
      monthlyIncome: player.quarterlySalary / 3,
      activeDebts: player.debts
    })).toBe(false);
  });
});