import { calculateQuarterlyPayment } from './amortization'

import type { Debt } from '@/core/types'

export function createDebt(
  principal: number,
  annualRate: number,
  quarters: number,
  type: Debt['type'],
  name: string,
  currentTurn: number,
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

export function calculateEarlyRepayment(debt: Debt): number {
  return Math.round(debt.remainingAmount)
}

export function processEarlyRepayment(debt: Debt, amount: number): Debt {
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
    debt.remainingQuarters,
  )

  return {
    ...debt,
    remainingAmount: newRemaining,
    quarterlyPayment: newQuarterlyPayment,
  }
}
