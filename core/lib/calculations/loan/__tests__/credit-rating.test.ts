import { describe, it, expect } from 'vitest';
import { createMockPlayer } from '../utils/mock-player';
import { calculateCreditRating, createDebt } from '../../loan-calculator';

describe('calculateCreditRating', () => {
  it('должен вернуть базовый рейтинг для игрока без кредитов', () => {
    const player = createMockPlayer();
    expect(calculateCreditRating({
      activeDebts: player.debts,
      monthlyIncome: player.quarterlySalary / 3,
      cash: player.stats.money
    })).toBe(70);
  });

  it('должен снизить рейтинг за активные кредиты', () => {
    const player = createMockPlayer({
      debts: [
        createDebt(50000, 12, 4, 'consumer_credit', 'Кредит 1', 1),
        createDebt(30000, 12, 4, 'consumer_credit', 'Кредит 2', 1),
      ],
    });
    expect(calculateCreditRating({
      activeDebts: player.debts,
      monthlyIncome: player.quarterlySalary / 3,
      cash: player.stats.money
    })).toBeLessThan(70);
  });

  it('должен снизить рейтинг за высокую долговую нагрузку', () => {
    const player = createMockPlayer({
      quarterlySalary: 90000,
      debts: [createDebt(200000, 12, 4, 'consumer_credit', 'Большой кредит', 1)],
    });
    expect(calculateCreditRating({
      activeDebts: player.debts,
      monthlyIncome: player.quarterlySalary / 3,
      cash: player.stats.money
    })).toBeLessThan(60);
  });

  it('должен повысить рейтинг за большие накопления', () => {
    const player = createMockPlayer({ stats: { money: 150000, happiness: 100, energy: 100, health: 100, sanity: 100, intelligence: 100 } });
    expect(calculateCreditRating({
      activeDebts: player.debts,
      monthlyIncome: player.quarterlySalary / 3,
      cash: player.stats.money
    })).toBe(80);
  });

  it('должен снизить рейтинг за малые накопления', () => {
    const player = createMockPlayer({ stats: { money: 5000, happiness: 100, energy: 100, health: 100, sanity: 100, intelligence: 100 } });
    expect(calculateCreditRating({
      activeDebts: player.debts,
      monthlyIncome: player.quarterlySalary / 3,
      cash: player.stats.money
    })).toBe(65);
  });
});