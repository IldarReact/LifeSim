import { describe, it, expect } from 'vitest';
import {
  calculateQuarterlyPayment,
  calculateTotalPayment,
  calculateOverpayment,
  calculateLoanRate,
  validateLoanTerm,
  getAvailableLoanTerms,
  createDebt,
  processDebtPayment,
  calculateCreditRating,
  calculateMaxLoanAmount,
  calculateEarlyRepayment,
  processEarlyRepayment,
  canTakeLoan,
} from './loan-calculator';
import type { Debt, GameState } from '@/core/types';

type Player = GameState['player'];

describe('loan-calculator', () => {
  describe('calculateQuarterlyPayment', () => {
    it('должен рассчитать квартальный платеж для кредита на 100000 под 12% на 4 квартала', () => {
      const payment = calculateQuarterlyPayment(100000, 12, 4);
      expect(payment).toBeGreaterThan(25000);
      expect(payment).toBeLessThan(27000);
    });

    it('должен вернуть 0 для нулевой суммы', () => {
      expect(calculateQuarterlyPayment(0, 12, 4)).toBe(0);
    });

    it('должен вернуть 0 для нулевого срока', () => {
      expect(calculateQuarterlyPayment(100000, 12, 0)).toBe(0);
    });

    it('должен рассчитать платеж для нулевой ставки', () => {
      const payment = calculateQuarterlyPayment(100000, 0, 4);
      expect(payment).toBe(25000); // 100000 / 4
    });
  });

  describe('calculateTotalPayment', () => {
    it('должен рассчитать общую сумму выплат', () => {
      const total = calculateTotalPayment(26000, 4);
      expect(total).toBe(104000);
    });
  });

  describe('calculateOverpayment', () => {
    it('должен рассчитать переплату', () => {
      const overpayment = calculateOverpayment(104000, 100000);
      expect(overpayment).toBe(4000);
    });
  });

  describe('calculateLoanRate', () => {
    it('должен рассчитать ставку для ипотеки с хорошим рейтингом', () => {
      const rate = calculateLoanRate(7, 'mortgage', 90);
      expect(rate).toBeCloseTo(9.5, 1); // 7 + 2 + 0.5
    });

    it('должен рассчитать ставку для потребительского кредита с плохим рейтингом', () => {
      const rate = calculateLoanRate(7, 'consumer_credit', 50);
      expect(rate).toBeCloseTo(14.5, 1); // 7 + 5 + 2.5
    });

    it('должен рассчитать ставку для студенческого кредита', () => {
      const rate = calculateLoanRate(7, 'student_loan', 70);
      expect(rate).toBeCloseTo(9.5, 1); // 7 + 1 + 1.5
    });
  });

  describe('validateLoanTerm', () => {
    it('должен валидировать корректный срок', () => {
      expect(validateLoanTerm(12)).toBe(4); // 12 месяцев = 4 квартала
    });

    it('должен вернуть null для некорректного срока', () => {
      expect(validateLoanTerm(5)).toBeNull(); // Не кратно 3
    });

    it('должен вернуть null для слишком короткого срока', () => {
      expect(validateLoanTerm(2)).toBeNull();
    });
  });

  describe('getAvailableLoanTerms', () => {
    it('должен вернуть массив доступных сроков', () => {
      const terms = getAvailableLoanTerms();
      expect(terms).toContain(12);
      expect(terms).toContain(36);
      expect(terms).toContain(360);
      expect(terms.length).toBeGreaterThan(10);
    });
  });

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

  describe('processDebtPayment', () => {
    it('должен обработать платеж по кредиту', () => {
      const debt = createDebt(100000, 12, 4, 'consumer_credit', 'Тест', 1);
      const updatedDebt = processDebtPayment(debt);

      expect(updatedDebt.remainingQuarters).toBe(3);
      expect(updatedDebt.remainingAmount).toBeLessThan(100000);
      expect(updatedDebt.remainingAmount).toBeGreaterThan(0);
    });

    it('не должен изменять погашенный кредит', () => {
      const debt: Debt = {
        id: 'test',
        name: 'Тест',
        type: 'consumer_credit',
        principalAmount: 100000,
        remainingAmount: 0,
        interestRate: 12,
        quarterlyPayment: 26000,
        termQuarters: 4,
        remainingQuarters: 0,
        startTurn: 1,
      };

      const updatedDebt = processDebtPayment(debt);
      expect(updatedDebt).toEqual(debt);
    });
  });

  describe('calculateCreditRating', () => {
    const createMockPlayer = (overrides?: Partial<Player>): Player => ({
      id: 'test',
      name: 'Test Player',
      age: 25,
      cash: 50000,
      salary: 50000,
      debts: [],
      personal: {
        health: 100,
        happiness: 100,
        energy: 100,
        sanity: 100,
        stress: 0,
        familyMembers: [],
      },
      education: {
        level: 'bachelor',
        activeCourses: [],
        completedCourses: [],
        activeUniversity: null,
      },
      job: null,
      businesses: [],
      properties: [],
      vehicles: [],
      investments: [],
      countryId: 'russia',
      ...overrides,
    });

    it('должен вернуть базовый рейтинг для игрока без кредитов', () => {
      const player = createMockPlayer();
      const rating = calculateCreditRating(player);
      expect(rating).toBe(70);
    });

    it('должен снизить рейтинг за активные кредиты', () => {
      const player = createMockPlayer({
        debts: [
          createDebt(50000, 12, 4, 'consumer_credit', 'Кредит 1', 1),
          createDebt(30000, 12, 4, 'consumer_credit', 'Кредит 2', 1),
        ],
      });
      const rating = calculateCreditRating(player);
      expect(rating).toBeLessThan(70);
    });

    it('должен снизить рейтинг за высокую долговую нагрузку', () => {
      const debt = createDebt(200000, 12, 4, 'consumer_credit', 'Большой кредит', 1);
      const player = createMockPlayer({
        salary: 30000,
        debts: [debt],
      });
      const rating = calculateCreditRating(player);
      expect(rating).toBeLessThan(60);
    });

    it('должен повысить рейтинг за большие накопления', () => {
      const player = createMockPlayer({
        cash: 150000,
      });
      const rating = calculateCreditRating(player);
      expect(rating).toBe(80);
    });

    it('должен снизить рейтинг за малые накопления', () => {
      const player = createMockPlayer({
        cash: 5000,
      });
      const rating = calculateCreditRating(player);
      expect(rating).toBe(65);
    });
  });

  describe('calculateMaxLoanAmount', () => {
    const createMockPlayer = (salary: number, debts: Debt[] = []): Player => ({
      id: 'test',
      name: 'Test',
      age: 25,
      cash: 50000,
      salary,
      debts,
      personal: {
        health: 100,
        happiness: 100,
        energy: 100,
        sanity: 100,
        stress: 0,
        familyMembers: [],
      },
      education: {
        level: 'bachelor',
        activeCourses: [],
        completedCourses: [],
        activeUniversity: null,
      },
      job: null,
      businesses: [],
      properties: [],
      vehicles: [],
      investments: [],
      countryId: 'russia',
    });

    it('должен рассчитать максимальную сумму для ипотеки', () => {
      const player = createMockPlayer(100000);
      const maxAmount = calculateMaxLoanAmount(player, 'mortgage');
      expect(maxAmount).toBeGreaterThan(0);
      expect(maxAmount).toBeLessThanOrEqual(100000 * 0.5 * 120);
    });

    it('должен рассчитать максимальную сумму для потребительского кредита', () => {
      const player = createMockPlayer(50000);
      const maxAmount = calculateMaxLoanAmount(player, 'consumer_credit');
      expect(maxAmount).toBeGreaterThan(0);
      expect(maxAmount).toBeLessThanOrEqual(50000 * 0.5 * 24);
    });

    it('должен вернуть 0 если уже есть большая долговая нагрузка', () => {
      const debt = createDebt(500000, 12, 40, 'mortgage', 'Ипотека', 1);
      const player = createMockPlayer(50000, [debt]);
      const maxAmount = calculateMaxLoanAmount(player, 'consumer_credit');
      expect(maxAmount).toBe(0);
    });
  });

  describe('calculateEarlyRepayment', () => {
    it('должен вернуть оставшуюся сумму долга', () => {
      const debt = createDebt(100000, 12, 4, 'consumer_credit', 'Тест', 1);
      const amount = calculateEarlyRepayment(debt);
      expect(amount).toBe(100000);
    });
  });

  describe('processEarlyRepayment', () => {
    it('должен полностью погасить кредит при полном досрочном погашении', () => {
      const debt = createDebt(100000, 12, 4, 'consumer_credit', 'Тест', 1);
      const updatedDebt = processEarlyRepayment(debt, 100000);

      expect(updatedDebt.remainingAmount).toBe(0);
      expect(updatedDebt.remainingQuarters).toBe(0);
    });

    it('должен частично погасить кредит и пересчитать платеж', () => {
      const debt = createDebt(100000, 12, 4, 'consumer_credit', 'Тест', 1);
      const updatedDebt = processEarlyRepayment(debt, 50000);

      expect(updatedDebt.remainingAmount).toBe(50000);
      expect(updatedDebt.remainingQuarters).toBe(4);
      expect(updatedDebt.quarterlyPayment).toBeLessThan(debt.quarterlyPayment);
    });
  });

  describe('canTakeLoan', () => {
    const createMockPlayer = (salary: number, cash: number, debts: Debt[] = []): Player => ({
      id: 'test',
      name: 'Test',
      age: 25,
      cash,
      salary,
      debts,
      personal: {
        health: 100,
        happiness: 100,
        energy: 100,
        sanity: 100,
        stress: 0,
        familyMembers: [],
      },
      education: {
        level: 'bachelor',
        activeCourses: [],
        completedCourses: [],
        activeUniversity: null,
      },
      job: null,
      businesses: [],
      properties: [],
      vehicles: [],
      investments: [],
      countryId: 'russia',
    });

    it('должен разрешить взять кредит при хороших условиях', () => {
      const player = createMockPlayer(100000, 50000);
      const canTake = canTakeLoan(player, 500000, 'mortgage');
      expect(canTake).toBe(true);
    });

    it('должен запретить взять слишком большой кредит', () => {
      const player = createMockPlayer(30000, 10000);
      const canTake = canTakeLoan(player, 10000000, 'mortgage');
      expect(canTake).toBe(false);
    });

    it('должен запретить взять кредит при низком рейтинге', () => {
      const existingDebts = [
        createDebt(100000, 12, 4, 'consumer_credit', 'Кредит 1', 1),
        createDebt(100000, 12, 4, 'consumer_credit', 'Кредит 2', 1),
        createDebt(100000, 12, 4, 'consumer_credit', 'Кредит 3', 1),
        createDebt(100000, 12, 4, 'consumer_credit', 'Кредит 4', 1),
      ];
      const player = createMockPlayer(30000, 1000, existingDebts);
      const canTake = canTakeLoan(player, 50000, 'consumer_credit');
      expect(canTake).toBe(false);
    });
  });
});
