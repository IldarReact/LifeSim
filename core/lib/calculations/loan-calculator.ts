import type { Debt, CountryEconomy, GameState } from '@/core/types';

type Player = GameState['player'];

/**
 * Рассчитывает квартальный платеж по кредиту (аннуитетный платеж)
 * @param principal - Сумма кредита
 * @param annualRate - Годовая процентная ставка (%)
 * @param quarters - Срок кредита в кварталах
 * @returns Квартальный платеж
 */
export function calculateQuarterlyPayment(
  principal: number,
  annualRate: number,
  quarters: number
): number {
  if (principal <= 0 || quarters <= 0) return 0;

  // Квартальная ставка
  const quarterlyRate = annualRate / 4 / 100;

  if (quarterlyRate === 0) {
    return Math.round(principal / quarters);
  }

  // Аннуитетная формула: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  const payment = principal *
    (quarterlyRate * Math.pow(1 + quarterlyRate, quarters)) /
    (Math.pow(1 + quarterlyRate, quarters) - 1);

  return Math.round(payment);
}

/**
 * Рассчитывает общую сумму выплат по кредиту
 * @param quarterlyPayment - Квартальный платеж
 * @param quarters - Срок кредита в кварталах
 * @returns Общая сумма выплат
 */
export function calculateTotalPayment(
  quarterlyPayment: number,
  quarters: number
): number {
  return quarterlyPayment * quarters;
}

/**
 * Рассчитывает переплату по кредиту
 * @param totalPayment - Общая сумма выплат
 * @param principal - Сумма кредита
 * @returns Переплата
 */
export function calculateOverpayment(
  totalPayment: number,
  principal: number
): number {
  return totalPayment - principal;
}

/**
 * Создает объект кредита
 * @param principal - Сумма кредита
 * @param annualRate - Годовая процентная ставка (%)
 * @param quarters - Срок кредита в кварталах
 * @param type - Тип кредита
 * @param name - Название кредита
 * @param currentTurn - Текущий ход
 * @returns Объект кредита
 */
export function createDebt(
  principal: number,
  annualRate: number,
  quarters: number,
  type: Debt['type'],
  name: string,
  currentTurn: number
): Debt {
  const quarterlyPayment = calculateQuarterlyPayment(principal, annualRate, quarters);

  // Calculate initial payment breakdown
  const quarterlyInterestRate = annualRate / 100 / 4;
  const quarterlyInterest = Math.round(principal * quarterlyInterestRate);
  const quarterlyPrincipal = Math.max(0, quarterlyPayment - quarterlyInterest);

  return {
    id: `debt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name,
    type,
    principalAmount: principal,
    remainingAmount: principal,
    interestRate: annualRate,
    quarterlyPayment,
    quarterlyPrincipal,
    quarterlyInterest,
    termQuarters: quarters,
    remainingQuarters: quarters,
    startTurn: currentTurn,
  };
}

/**
 * Обрабатывает платеж по кредиту за квартал
 * @param debt - Кредит
 * @returns Обновленный кредит
 */
export function processDebtPayment(debt: Debt): Debt {
  if (debt.remainingQuarters <= 0) {
    return debt;
  }

  // Квартальная ставка
  const quarterlyRate = debt.interestRate / 4 / 100;

  // Проценты за квартал
  const interestPayment = debt.remainingAmount * quarterlyRate;

  // Основной долг
  const principalPayment = debt.quarterlyPayment - interestPayment;

  return {
    ...debt,
    remainingAmount: Math.max(0, debt.remainingAmount - principalPayment),
    remainingQuarters: debt.remainingQuarters - 1,
  };
}

/**
 * Рассчитывает процентную ставку по кредиту на основе ключевой ставки ЦБ
 * @param keyRate - Ключевая ставка ЦБ (%)
 * @param debtType - Тип кредита
 * @param creditRating - Кредитный рейтинг игрока (0-100)
 * @returns Процентная ставка по кредиту (%)
 */
export function calculateLoanRate(
  keyRate: number,
  debtType: Debt['type'],
  creditRating: number = 70
): number {
  // Базовая надбавка в зависимости от типа кредита
  const baseMarkup: Record<Debt['type'], number> = {
    mortgage: 2, // Ипотека: ключевая ставка + 2%
    consumer_credit: 5, // Потребительский кредит: ключевая ставка + 5%
    student_loan: 1, // Студенческий кредит: ключевая ставка + 1%
  };

  // Надбавка за кредитный рейтинг (чем ниже рейтинг, тем выше ставка)
  const ratingMarkup = (100 - creditRating) / 20; // От 0% до 5%

  return keyRate + baseMarkup[debtType] + ratingMarkup;
}

/**
 * Валидирует срок кредита (должен быть кратен 3 месяцам = 1 кварталу)
 * @param months - Срок в месяцах
 * @returns Срок в кварталах или null если невалидный
 */
export function validateLoanTerm(months: number): number | null {
  if (months < 3 || months % 3 !== 0) {
    return null;
  }
  return months / 3;
}

/**
 * Получает доступные сроки кредитования в месяцах
 * @returns Массив доступных сроков
 */
export function getAvailableLoanTerms(): number[] {
  return [
    3, 6, 9, 12, // До года
    18, 24, 30, 36, // 1-3 года
    48, 60, // 4-5 лет
    84, 120, // 7-10 лет
    180, 240, 300, 360 // 15-30 лет (ипотека)
  ];
}

/**
 * Рассчитывает кредитный рейтинг игрока (0-100)
 * @param player - Игрок
 * @returns Кредитный рейтинг
 */
export function calculateCreditRating(player: Player | null): number {
  if (!player) return 0;

  let rating = 70; // Базовый рейтинг

  // Учитываем активные кредиты
  const activeDebts = player.debts.filter((d: Debt) => d.remainingQuarters > 0);
  rating -= activeDebts.length * 5; // -5 за каждый активный кредит

  // Учитываем просрочки (если есть поле в Player)
  // rating -= player.missedPayments * 10;

  // Учитываем доход
  const monthlyIncome = (player.quarterlySalary || 0) / 3;
  const totalDebtPayment = activeDebts.reduce((sum: number, d: Debt) => sum + d.quarterlyPayment, 0) / 3;
  const debtToIncomeRatio = monthlyIncome > 0 ? totalDebtPayment / monthlyIncome : 0;

  if (debtToIncomeRatio > 0.5) {
    rating -= 20; // Высокая долговая нагрузка
  } else if (debtToIncomeRatio > 0.3) {
    rating -= 10;
  }

  // Учитываем наличные
  if (player.cash > 100000) {
    rating += 10;
  } else if (player.cash < 10000) {
    rating -= 5;
  }

  return Math.max(0, Math.min(100, rating));
}

/**
 * Рассчитывает максимальную сумму кредита для игрока
 * @param player - Игрок
 * @param debtType - Тип кредита
 * @returns Максимальная сумма кредита
 */
export function calculateMaxLoanAmount(
  player: Player | null,
  debtType: Debt['type']
): number {
  if (!player) return 0;

  const monthlyIncome = (player.quarterlySalary || 0) / 3;
  const activeDebts = player.debts.filter((d: Debt) => d.remainingQuarters > 0);
  const currentDebtPayment = activeDebts.reduce((sum: number, d: Debt) => sum + d.quarterlyPayment, 0) / 3;

  // Максимальная долговая нагрузка: 50% от дохода
  const maxMonthlyPayment = monthlyIncome * 0.5 - currentDebtPayment;

  if (maxMonthlyPayment <= 0) return 0;

  // Множители для разных типов кредитов
  const multipliers: Record<Debt['type'], number> = {
    mortgage: 120, // 10 лет
    consumer_credit: 24, // 2 года
    student_loan: 60, // 5 лет
  };

  return Math.floor(maxMonthlyPayment * multipliers[debtType]);
}

/**
 * Рассчитывает сумму досрочного погашения
 * @param debt - Кредит
 * @returns Сумма для полного досрочного погашения
 */
export function calculateEarlyRepayment(debt: Debt): number {
  return Math.round(debt.remainingAmount);
}

/**
 * Обрабатывает досрочное погашение кредита
 * @param debt - Кредит
 * @param amount - Сумма досрочного погашения
 * @returns Обновленный кредит
 */
export function processEarlyRepayment(debt: Debt, amount: number): Debt {
  const newRemaining = Math.max(0, debt.remainingAmount - amount);

  if (newRemaining === 0) {
    return {
      ...debt,
      remainingAmount: 0,
      remainingQuarters: 0,
    };
  }

  // Пересчитываем квартальный платеж
  const newQuarterlyPayment = calculateQuarterlyPayment(
    newRemaining,
    debt.interestRate,
    debt.remainingQuarters
  );

  return {
    ...debt,
    remainingAmount: newRemaining,
    quarterlyPayment: newQuarterlyPayment,
  };
}

/**
 * Проверяет, может ли игрок взять кредит
 * @param player - Игрок
 * @param amount - Сумма кредита
 * @param debtType - Тип кредита
 * @returns true если может взять кредит
 */
export function canTakeLoan(
  player: Player | null,
  amount: number,
  debtType: Debt['type']
): boolean {
  if (!player) return false;

  const maxAmount = calculateMaxLoanAmount(player, debtType);
  const creditRating = calculateCreditRating(player);

  return amount <= maxAmount && creditRating >= 30; // Минимальный рейтинг 30
}
