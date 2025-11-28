import { describe, it, expect } from 'vitest';
import { createMockPlayer } from '../utils/mock-player';
import { calculateCreditRating, createDebt } from '../../loan-calculator';

describe('calculateCreditRating', () => {
  it('должен вернуть базовый рейтинг для игрока без кредитов', () => {
    const player = createMockPlayer();
    expect(calculateCreditRating(player)).toBe(70);
  });

  it('должен снизить рейтинг за активные кредиты', () => {
    const player = createMockPlayer({
      debts: [
        createDebt(50000, 12, 4, 'consumer_credit', 'Кредит 1', 1),
        createDebt(30000, 12, 4, 'consumer_credit', 'Кредит 2', 1),
      ],
    });
    expect(calculateCreditRating(player)).toBeLessThan(70);
  });

  it('должен снизить рейтинг за высокую долговую нагрузку', () => {
    const player = createMockPlayer({
      quarterlySalary: 90000,
      debts: [createDebt(200000, 12, 4, 'consumer_credit', 'Большой кредит', 1)],
    });
    expect(calculateCreditRating(player)).toBeLessThan(60);
  });

  it('должен повысить рейтинг за большие накопления', () => {
    expect(calculateCreditRating(createMockPlayer({ cash: 150000 }))).toBe(80);
  });

  it('должен снизить рейтинг за малые накопления', () => {
    expect(calculateCreditRating(createMockPlayer({ cash: 5000 }))).toBe(65);
  });
});