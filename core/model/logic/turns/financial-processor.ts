import type { GameStore } from '../../slices/types'
import type { FamilyMember, QuarterlyReport } from '@/core/types'
import type { LifestyleExpensesBreakdown } from './lifestyle-processor'
import { calculateQuarterlyReport } from '@/core/lib/calculations/calculate-quarterly-report'
import { getCountry } from '@/core/lib/data-loaders/economy-loader'

interface BusinessResult {
  totalIncome: number
  totalExpenses: number
  totalTax: number
}

export function processFinancials(
  state: GameStore,
  countryId: string,
  updatedFamilyMembers: FamilyMember[],
  lifestyleExpenses: number,
  lifestyleExpensesBreakdown: LifestyleExpensesBreakdown,
  businessResult: BusinessResult,
  buffIncomeMod: number,
) {
  if (!state.player) {
    const country = state.countries[countryId] ||
      getCountry(countryId) || {
        id: countryId,
        name: 'Unknown',
        archetype: 'poor' as const,
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

    return {
      country,
      familyIncome: 0,
      familyExpenses: 0,
      assetIncome: 0,
      assetMaintenance: 0,
      debtInterest: 0,
      quarterlyReport: {
        income: {
          salary: 0,
          businessRevenue: 0,
          familyIncome: 0,
          assetIncome: 0,
          capitalGains: 0,
          total: 0,
        },
        expenses: {
          living: 0,
          food: 0,
          housing: 0,
          transport: 0,
          credits: 0,
          mortgage: 0,
          other: 0,
          family: 0,
          business: 0,
          debtInterest: 0,
          assetMaintenance: 0,
          total: 0,
        },
        taxes: {
          income: 0,
          business: 0,
          capital: 0,
          property: 0,
          total: 0,
        },
        netProfit: 0,
        warning: null,
      } as QuarterlyReport,
      netProfit: 0,
    }
  }

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
    (acc: number, m: FamilyMember) => acc + (m.income || 0),
    0,
  )
  const familyExpenses = updatedFamilyMembers.reduce(
    (acc: number, m: FamilyMember) => acc + (m.expenses || 0),
    0,
  )

  let totalAssetIncome = 0
  totalAssetIncome += state.player.assets
    .filter((a) => a.type !== 'deposit')
    .reduce((acc, a) => acc + a.income * 3, 0)

  const depositAnnualRate = (country.keyRate * 0.7) / 100
  const depositQuarterlyRate = depositAnnualRate / 4

  const depositsIncome = state.player.assets
    .filter((a) => a.type === 'deposit')
    .reduce((acc, a) => acc + a.currentValue * depositQuarterlyRate, 0)

  totalAssetIncome += depositsIncome

  const assetIncome = totalAssetIncome
  const assetMaintenance = state.player.assets.reduce((acc, a) => acc + a.expenses * 3, 0)
  const debtInterest = state.player.debts.reduce((acc, d) => acc + d.quarterlyInterest, 0)

  const quarterlyReport = calculateQuarterlyReport({
    player: state.player,
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
      taxes: businessResult.totalTax,
    },
    lifestyleExpenses,
    expensesBreakdown: lifestyleExpensesBreakdown as unknown as Record<string, number>,
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
