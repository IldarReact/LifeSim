// features/bank/lib/bank-calculator.ts
import { LoanType } from '@/core/types/bank.types'
import type { CountryEconomy } from '@/core/types/economy.types'

export const getDepositRate = (country: CountryEconomy): number => {
  return country.keyRate * 0.7
}

export const getBaseLoanRate = (country: CountryEconomy, type: LoanType): number => {
  const base = country.keyRate
  switch (type) {
    case 'consumer_credit': return base + 8
    case 'mortgage': return base + 3
    case 'student_loan': return base + 1
  }
}

export const getFinalLoanRate = (
  country: CountryEconomy,
  type: LoanType,
  creditScore: number = 600
): number => {
  const base = getBaseLoanRate(country, type)
  const multiplier = 1 - (creditScore - 300) / 1000 // 850 → ×0.55, 300 → ×1.0
  return Math.max(1, base * multiplier)
}