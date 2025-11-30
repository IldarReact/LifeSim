import type { Debt } from '@/core/types'

/**
 * ==================================
 * Базовая математика кредита
 * ==================================
 */

export function calculateQuarterlyPayment(
  principal: number,
  annualRate: number,
  quarters: number
): number {
  if (principal <= 0 || quarters <= 0) return 0

  const quarterlyRate = annualRate / 100 / 4

  if (quarterlyRate === 0) {
    return Math.round(principal / quarters)
  }

  const payment =
    (principal *
      quarterlyRate *
      Math.pow(1 + quarterlyRate, quarters)) /
    (Math.pow(1 + quarterlyRate, quarters) - 1)

  return Math.round(payment)
}

export function calculateTotalPayment(
  quarterlyPayment: number,
  quarters: number
): number {
  return Math.round(quarterlyPayment * quarters)
}

export function calculateOverpayment(
  totalPayment: number,
  principal: number
): number {
  return Math.round(totalPayment - principal)
}

/**
 * ==================================
 * Создание кредита
 * ==================================
 */

export function createDebt(
  principal: number,
  annualRate: number,
  quarters: number,
  type: Debt['type'],
  name: string,
  currentTurn: number
): Debt {
  const quarterlyPayment = calculateQuarterlyPayment(principal, annualRate, quarters)

  const quarterlyRate = annualRate / 100 / 4
  const interest = Math.round(principal * quarterlyRate)
  const principalPart = Math.max(0, quarterlyPayment - interest)

  return {
    id: `debt_${Date.now()}_${crypto.randomUUID()}`,
    name,
    type,

    principalAmount: principal,
    remainingAmount: principal,

    interestRate: annualRate,

    quarterlyPayment,
    quarterlyPrincipal: principalPart,
    quarterlyInterest: interest,

    termQuarters: quarters,
    remainingQuarters: quarters,

    startTurn: currentTurn,
  }
}

/**
 * ==================================
 * Платеж по кредиту за квартал
 * ==================================
 */

export function processDebtPayment(debt: Debt): Debt {
  if (debt.remainingQuarters <= 0 || debt.remainingAmount <= 0) {
    return debt
  }

  const quarterlyRate = debt.interestRate / 100 / 4

  const interestPayment =
    Math.round(debt.remainingAmount * quarterlyRate)

  const principalPayment =
    Math.max(0, debt.quarterlyPayment - interestPayment)

  return {
    ...debt,
    remainingAmount: Math.max(
      0,
      debt.remainingAmount - principalPayment
    ),
    remainingQuarters: debt.remainingQuarters - 1,
  }
}

/**
 * ==================================
 * Процентная ставка кредита
 * ==================================
 */

export function calculateLoanRate(
  keyRate: number,
  debtType: Debt['type'],
  creditRating: number = 70
): number {
  const baseMarkup: Record<Debt['type'], number> = {
    mortgage: 2,
    consumer_credit: 5,
    student_loan: 1,
  }

  const ratingMarkup = (100 - creditRating) / 20

  return Number(
    (keyRate + baseMarkup[debtType] + ratingMarkup).toFixed(2)
  )
}

/**
 * ==================================
 * Валидация срока
 * ==================================
 */

export function validateLoanTerm(months: number): number | null {
  if (months < 3 || months % 3 !== 0) return null
  return months / 3
}

export function getAvailableLoanTerms(): number[] {
  return [
    3, 6, 9, 12,
    18, 24, 30, 36,
    48, 60,
    84, 120,
    180, 240, 300, 360,
  ]
}

/**
 * ==================================
 * Кредитный рейтинг
 * ==================================
 */

interface CreditRatingParams {
  activeDebts: Debt[]
  monthlyIncome: number
  cash: number
}

export function calculateCreditRating({
  activeDebts,
  monthlyIncome,
  cash
}: CreditRatingParams): number {
  let rating = 70

  rating -= activeDebts.length * 5

  const monthlyPayments =
    activeDebts.reduce((sum, d) => sum + d.quarterlyPayment, 0) / 3

  const debtRatio =
    monthlyIncome > 0
      ? monthlyPayments / monthlyIncome
      : 1

  if (debtRatio > 0.5) rating -= 20
  else if (debtRatio > 0.3) rating -= 10

  if (cash > 100_000) rating += 10
  else if (cash < 10_000) rating -= 5

  return Math.max(0, Math.min(100, rating))
}

/**
 * ==================================
 * Максимальная сумма кредита
 * ==================================
 */

export function calculateMaxLoanAmount(
  monthlyIncome: number,
  activeDebts: Debt[],
  debtType: Debt['type']
): number {
  const currentMonthlyDebt =
    activeDebts.reduce((sum, d) => sum + d.quarterlyPayment, 0) / 3

  const maxAllowedPayment =
    monthlyIncome * 0.5 - currentMonthlyDebt

  if (maxAllowedPayment <= 0) return 0

  const multipliers: Record<Debt['type'], number> = {
    mortgage: 120,
    consumer_credit: 24,
    student_loan: 60,
  }

  return Math.floor(maxAllowedPayment * multipliers[debtType])
}

/**
 * ==================================
 * Досрочное погашение
 * ==================================
 */

export function calculateEarlyRepayment(debt: Debt): number {
  return Math.round(debt.remainingAmount)
}

export function processEarlyRepayment(
  debt: Debt,
  amount: number
): Debt {
  const newRemaining = Math.max(0, debt.remainingAmount - amount)

  if (newRemaining === 0) {
    return {
      ...debt,
      remainingAmount: 0,
      remainingQuarters: 0,
    }
  }

  const newQuarterlyPayment = calculateQuarterlyPayment(
    newRemaining,
    debt.interestRate,
    debt.remainingQuarters
  )

  return {
    ...debt,
    remainingAmount: newRemaining,
    quarterlyPayment: newQuarterlyPayment,
  }
}

/**
 * ==================================
 * Валидация возможности взять кредит
 * ==================================
 */

interface CanTakeLoanParams {
  amount: number
  debtType: Debt['type']
  cash: number
  monthlyIncome: number
  activeDebts: Debt[]
}

export function canTakeLoan({
  amount,
  debtType,
  cash,
  monthlyIncome,
  activeDebts
}: CanTakeLoanParams): boolean {

  const maxAmount = calculateMaxLoanAmount(
    monthlyIncome,
    activeDebts,
    debtType
  )

  const rating = calculateCreditRating({
    activeDebts,
    monthlyIncome,
    cash
  })

  return amount <= maxAmount && rating >= 30
}
