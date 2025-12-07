/**
 * Rate calculations and credit rating helpers
 */
import type { Debt } from '@/core/types'

export function calculateLoanRate(
  keyRate: number,
  debtType: Debt['type'],
  creditRating: number = 70,
): number {
  const baseMarkup: Record<string, number> = {
    mortgage: 2,
    consumer_credit: 5,
    student_loan: 1,
  }

  const ratingMarkup = (100 - creditRating) / 20

  return Number((keyRate + baseMarkup[debtType] + ratingMarkup).toFixed(2))
}

export function calculateCreditRating({
  activeDebts,
  monthlyIncome,
  cash,
}: {
  activeDebts: Debt[]
  monthlyIncome: number
  cash: number
}): number {
  let rating = 70
  rating -= activeDebts.length * 5

  const monthlyPayments = activeDebts.reduce((sum, d) => sum + d.quarterlyPayment, 0) / 3
  const debtRatio = monthlyIncome > 0 ? monthlyPayments / monthlyIncome : 1

  if (debtRatio > 0.5) rating -= 20
  else if (debtRatio > 0.3) rating -= 10

  if (cash > 100_000) rating += 10
  else if (cash < 10_000) rating -= 5

  return Math.max(0, Math.min(100, rating))
}

export function calculateMaxLoanAmount(
  monthlyIncome: number,
  activeDebts: Debt[],
  debtType: Debt['type'],
): number {
  const currentMonthlyDebt = activeDebts.reduce((sum, d) => sum + d.quarterlyPayment, 0) / 3
  const maxAllowedPayment = monthlyIncome * 0.5 - currentMonthlyDebt
  if (maxAllowedPayment <= 0) return 0

  const multipliers: Record<string, number> = {
    mortgage: 120,
    consumer_credit: 24,
    student_loan: 60,
  }

  return Math.floor(maxAllowedPayment * multipliers[debtType])
}

export function canTakeLoan({
  amount,
  debtType,
  cash,
  monthlyIncome,
  activeDebts,
}: {
  amount: number
  debtType: Debt['type']
  cash: number
  monthlyIncome: number
  activeDebts: Debt[]
}): boolean {
  const maxAmount = calculateMaxLoanAmount(monthlyIncome, activeDebts, debtType)
  const rating = calculateCreditRating({ activeDebts, monthlyIncome, cash })
  return amount <= maxAmount && rating >= 30
}
