import type { Debt, CountryEconomy } from '@/core/types';

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
  // Квартальная ставка
  const quarterlyRate = annualRate / 4 / 100;

  if (quarterlyRate === 0) {
    return principal / quarters;
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

  return {
    id: `debt_${Date.now()}`,
    name,
    type,
    principalAmount: principal,
    remainingAmount: principal,
    interestRate: annualRate,
    quarterlyPayment,
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
