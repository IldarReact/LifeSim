// Calculate quarterly financial report based on player type
import type {
  PlayerState,
  QuarterlyReport,
  IncomeBreakdown,
  ExpensesBreakdown,
  TaxesBreakdown,
} from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'
import { calculateBusinessFinancials } from '@/core/lib/business-utils'
import { calculateEmployeeQuarterlyReport } from './report/employee'
import { calculateBusinessOwnerQuarterlyReport } from './report/business-owner'
import { calculateMixedQuarterlyReport } from './report/mixed'

/**
 * Determines the player's primary activity type
 */
export function determinePlayerType(player: PlayerState): 'employee' | 'business_owner' | 'mixed' {
  const hasJob = player.quarterlySalary > 0 || player.jobs.length > 0
  const hasBusiness = player.businesses.length > 0

  if (hasJob && hasBusiness) return 'mixed'
  if (hasBusiness) return 'business_owner'
  return 'employee'
}

interface QuarterlyReportParams {
  player: PlayerState
  country: CountryEconomy
  familyIncome: number
  familyExpenses: number
  assetIncome: number
  assetMaintenance: number
  debtInterest: number
  buffIncomeMod: number
  // Optional override for business financials (to avoid re-calculation)
  businessFinancialsOverride?: {
    income: number
    expenses: number
  }
  lifestyleExpenses?: number
  expensesBreakdown?: {
    food: number
    housing: number
    transport: number
    credits: number
    mortgage: number
    other: number
  }
}

// Delegated implementations moved to smaller modules under report/

/**
 * Main function to calculate quarterly report based on player type
 */
export function calculateQuarterlyReport(params: QuarterlyReportParams): QuarterlyReport {
  const playerType = determinePlayerType(params.player)

  switch (playerType) {
    case 'employee':
      return calculateEmployeeQuarterlyReport(params as any)
    case 'business_owner':
      return calculateBusinessOwnerQuarterlyReport(params as any)
    case 'mixed':
      return calculateMixedQuarterlyReport(params as any)
  }
}
