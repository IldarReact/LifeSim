import type {
  PlayerState,
  QuarterlyReport,
  IncomeBreakdown,
  ExpensesBreakdown,
  TaxesBreakdown,
} from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'
import { calculateBusinessFinancials } from '@/core/lib/business-utils'

export function calculateBusinessOwnerQuarterlyReport(params: {
  player: PlayerState
  country: CountryEconomy
  familyIncome: number
  familyExpenses: number
  assetIncome: number
  assetMaintenance: number
  debtInterest: number
  buffIncomeMod: number
  businessFinancialsOverride?: { income: number; expenses: number }
  lifestyleExpenses?: number
  expensesBreakdown?: Record<string, number>
}): QuarterlyReport {
  const {
    player,
    country,
    familyIncome,
    familyExpenses,
    assetIncome,
    assetMaintenance,
    debtInterest,
    buffIncomeMod,
    businessFinancialsOverride,
  } = params as any

  let businessRevenue = 0
  let businessExpenses = 0

  if (businessFinancialsOverride) {
    businessRevenue = businessFinancialsOverride.income
    businessExpenses = businessFinancialsOverride.expenses
  } else {
    const financials = player.businesses.reduce(
      (acc: any, b: any) => {
        const fin = calculateBusinessFinancials(b)
        return {
          revenue: acc.revenue + fin.income,
          expenses: acc.expenses + fin.expenses,
        }
      },
      { revenue: 0, expenses: 0 },
    )
    businessRevenue = financials.revenue
    businessExpenses = financials.expenses
  }

  const adjustedBusinessRevenue = businessRevenue * (1 + buffIncomeMod / 100)
  const totalIncome = adjustedBusinessRevenue + familyIncome + assetIncome

  const income: IncomeBreakdown = {
    salary: 0,
    businessRevenue: adjustedBusinessRevenue,
    familyIncome,
    assetIncome,
    capitalGains: 0,
    total: totalIncome,
  }

  const baseLiving = 1000 * 3 * country.costOfLivingModifier
  const breakdown = params.expensesBreakdown || {
    food: params.lifestyleExpenses || 0,
    housing: 0,
    transport: 0,
    credits: debtInterest,
    mortgage: 0,
    other: familyExpenses,
  }

  const expenses: ExpensesBreakdown = {
    living: Math.round(
      baseLiving + breakdown.food + breakdown.housing + breakdown.transport + breakdown.other,
    ),
    food: Math.round(breakdown.food),
    housing: Math.round(breakdown.housing),
    transport: Math.round(breakdown.transport),
    credits: Math.round(breakdown.credits),
    mortgage: Math.round(breakdown.mortgage),
    other: Math.round(breakdown.other),
    family: Math.round(familyExpenses),
    business: Math.round(businessExpenses),
    debtInterest: Math.round(debtInterest),
    assetMaintenance: Math.round(assetMaintenance),
    total: Math.round(
      baseLiving +
        breakdown.food +
        breakdown.housing +
        breakdown.transport +
        breakdown.other +
        familyExpenses +
        businessExpenses +
        debtInterest +
        assetMaintenance,
    ),
  }

  const profitBeforeTax = totalIncome - expenses.total
  const businessTax = Math.max(0, profitBeforeTax * (country.taxRate / 100))
  const propertyTax = player.assets
    .filter((a: any) => a.type === 'housing')
    .reduce((sum: number, a: any) => sum + a.currentValue * 0.00125, 0)

  const taxes: TaxesBreakdown = {
    income: 0,
    business: Math.round(businessTax),
    capital: 0,
    property: Math.round(propertyTax),
    total: Math.round(businessTax + propertyTax),
  }

  const netProfit = profitBeforeTax - taxes.total

  return {
    income,
    expenses,
    taxes,
    netProfit: Math.round(netProfit),
    warning: netProfit < 0 ? 'Вы теряете деньги!' : null,
  }
}
