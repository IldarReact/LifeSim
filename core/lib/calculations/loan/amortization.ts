/**
 * Amortization and payment calculations for loans
 */
export function calculateQuarterlyPayment(
  principal: number,
  annualRate: number,
  quarters: number,
): number {
  if (principal <= 0 || quarters <= 0) return 0

  const quarterlyRate = annualRate / 100 / 4

  if (quarterlyRate === 0) {
    return Math.round(principal / quarters)
  }

  const payment =
    (principal * quarterlyRate * Math.pow(1 + quarterlyRate, quarters)) /
    (Math.pow(1 + quarterlyRate, quarters) - 1)
  return Math.round(payment)
}

export function calculateTotalPayment(quarterlyPayment: number, quarters: number): number {
  return Math.round(quarterlyPayment * quarters)
}

export function calculateOverpayment(totalPayment: number, principal: number): number {
  return Math.round(totalPayment - principal)
}

import type { Debt } from '@/core/types'

export function processDebtPayment(debt: Debt): Debt {
  if (debt.remainingQuarters <= 0 || debt.remainingAmount <= 0) return debt

  const quarterlyRate = debt.interestRate / 100 / 4
  const interestPayment = Math.round(debt.remainingAmount * quarterlyRate)
  const principalPayment = Math.max(0, debt.quarterlyPayment - interestPayment)

  return {
    ...debt,
    remainingAmount: Math.max(0, debt.remainingAmount - principalPayment),
    remainingQuarters: debt.remainingQuarters - 1,
  }
}
