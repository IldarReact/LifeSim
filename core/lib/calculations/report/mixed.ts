import type { PlayerState, QuarterlyReport } from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'
import { calculateBusinessFinancials } from '@/core/lib/business/business-utils'
import { getInflatedPrice } from '../price-helpers'

export function calculateMixedQuarterlyReport(params: {
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

  const baseSalary = player.jobs.reduce((sum: number, job: any) => {
    const monthlySalary = job.salary
    // Применить инфляцию к зарплате
    const inflatedMonthlySalary = getInflatedPrice(monthlySalary, country, 'salaries')
    return sum + inflatedMonthlySalary * 3
  }, 0)
  const salary = baseSalary * (1 + buffIncomeMod / 100)
  const adjustedBusinessRevenue = businessRevenue * (1 + buffIncomeMod / 100)
  const totalIncome = salary + adjustedBusinessRevenue + familyIncome + assetIncome

  const income = {
    salary,
    businessRevenue: adjustedBusinessRevenue,
    familyIncome,
    assetIncome,
    capitalGains: 0,
    total: totalIncome,
  }

  // Базовые расходы на жизнь с инфляцией (категория services)
  const baseLifestyleCost = 1000 * 3 * country.costOfLivingModifier
  const baseLiving = getInflatedPrice(baseLifestyleCost, country, 'services')

  const breakdown = params.expensesBreakdown || {
    food: params.lifestyleExpenses || 0,
    housing: 0,
    transport: 0,
    credits: debtInterest,
    mortgage: 0,
    other: familyExpenses,
  }

  const expensesTotal = Math.round(
    baseLiving +
    breakdown.food +
    breakdown.housing +
    breakdown.transport +
    breakdown.other +
    familyExpenses +
    businessExpenses +
    debtInterest +
    assetMaintenance,
  )

  const salaryTax = salary * (country.taxRate / 100)
  const businessProfit = adjustedBusinessRevenue - businessExpenses
  const businessTax = Math.max(0, businessProfit * (country.taxRate / 100))
  const propertyTax = player.assets
    .filter((a: any) => a.type === 'housing')
    .reduce((sum: number, a: any) => sum + a.currentValue * 0.00125, 0)

  const taxesTotal = Math.round(salaryTax + businessTax + propertyTax)

  const netProfit = totalIncome - expensesTotal - taxesTotal

  return {
    income: income as any,
    expenses: {
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
      total: expensesTotal,
    } as any,
    taxes: {
      income: Math.round(salaryTax),
      business: Math.round(businessTax),
      capital: 0,
      property: Math.round(propertyTax),
      total: taxesTotal,
    } as any,
    netProfit: Math.round(netProfit),
    warning: netProfit < 0 ? 'Вы теряете деньги!' : null,
  }
}
