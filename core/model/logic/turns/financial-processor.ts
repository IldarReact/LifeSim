import type { GameStore } from '../../slices/types'

import { calculateQuarterlyReport } from '@/core/lib/calculations/calculate-quarterly-report'
import { getCountry } from '@/core/lib/data-loaders/economy-loader'

export function processFinancials(
  state: GameStore,
  countryId: string,
  updatedFamilyMembers: any[],
  lifestyleExpenses: number,
  lifestyleExpensesBreakdown: any,
  businessResult: any,
  buffIncomeMod: number,
) {
  const country = state.countries[countryId] ||
    getCountry(countryId) || {
      id: countryId,
      name: 'Unknown',
      archetype: 'poor',
      gdpGrowth: 0,
      inflation: 2,
      keyRate: 5,
      interestRate: 5,
      unemployment: 5,
      taxRate: 13,
      corporateTaxRate: 20,
      salaryModifier: 1,
      costOfLivingModifier: 1.0,
      activeEvents: [],
    }

  const familyIncome = updatedFamilyMembers.reduce(
    (acc: number, m: any) => acc + (m.income || 0),
    0,
  )
  const familyExpenses = updatedFamilyMembers.reduce(
    (acc: number, m: any) => acc + (m.expenses || 0),
    0,
  )

  let totalAssetIncome = 0
  totalAssetIncome += state
    .player!.assets.filter((a) => a.type !== 'deposit')
    .reduce((acc, a) => acc + a.income * 3, 0)

  const depositAnnualRate = (country.keyRate * 0.7) / 100
  const depositQuarterlyRate = depositAnnualRate / 4

  const depositsIncome = state
    .player!.assets.filter((a) => a.type === 'deposit')
    .reduce((acc, a) => acc + a.currentValue * depositQuarterlyRate, 0)

  totalAssetIncome += depositsIncome

  const assetIncome = totalAssetIncome
  const assetMaintenance = state.player!.assets.reduce((acc, a) => acc + a.expenses * 3, 0)
  const debtInterest = state.player!.debts.reduce((acc, d) => acc + d.quarterlyInterest, 0)

  const quarterlyReport = calculateQuarterlyReport({
    player: state.player!,
    country,
    familyIncome,
    familyExpenses,
    assetIncome,
    assetMaintenance,
    debtInterest,
    buffIncomeMod,
    businessFinancialsOverride: {
      income: businessResult.totalIncome,
      expenses: businessResult.totalExpenses,
    },
    lifestyleExpenses,
    expensesBreakdown: lifestyleExpensesBreakdown,
  })

  const netProfit = quarterlyReport.netProfit

  return {
    country,
    familyIncome,
    familyExpenses,
    assetIncome,
    assetMaintenance,
    debtInterest,
    quarterlyReport,
    netProfit,
  }
}
