// Calculate quarterly financial report based on player type
import { calculateBusinessOwnerQuarterlyReport } from './report/business-owner'
import { calculateEmployeeQuarterlyReport } from './report/employee'
import { calculateMixedQuarterlyReport } from './report/mixed'

import type { Player, QuarterlyReport } from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'

/**
 * Determines the player's primary activity type
 */
export function determinePlayerType(player: Player): 'employee' | 'business_owner' | 'mixed' {
  const hasJob = player.quarterlySalary > 0 || player.jobs.length > 0
  const hasBusiness = player.businesses.length > 0

  if (hasJob && hasBusiness) return 'mixed'
  if (hasBusiness) return 'business_owner'
  return 'employee'
}

interface QuarterlyReportParams {
  player: Player
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
    taxes: number
  }
  lifestyleExpenses?: number
  expensesBreakdown?: Record<string, number>
}

// Delegated implementations moved to smaller modules under report/

/**
 * Main function to calculate quarterly report based on player type
 */
export function calculateQuarterlyReport(params: QuarterlyReportParams): QuarterlyReport {
  const playerType = determinePlayerType(params.player)

  switch (playerType) {
    case 'employee':
      return calculateEmployeeQuarterlyReport(params)
    case 'business_owner':
      return calculateBusinessOwnerQuarterlyReport(params)
    case 'mixed':
      return calculateMixedQuarterlyReport(params)
  }
}
