import type {
  PlayerState,
  QuarterlyReport,
  IncomeBreakdown,
  ExpensesBreakdown,
  TaxesBreakdown,
} from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'

export function calculateEmployeeQuarterlyReport(params: {
  player: PlayerState
  country: CountryEconomy
  familyIncome: number
  familyExpenses: number
  assetIncome: number
  assetMaintenance: number
  debtInterest: number
  buffIncomeMod: number
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
  } = params as any

  // Income
  const baseSalary = player.jobs.reduce((sum: number, job: any) => sum + job.salary * 3, 0)
  const salary = baseSalary * (1 + buffIncomeMod / 100)
  const totalIncome = salary + familyIncome + assetIncome

  const income: IncomeBreakdown = {
    salary,
    businessRevenue: 0,
    familyIncome,
    assetIncome,
    capitalGains: 0,
    total: totalIncome,
  }

  const incomeTax = totalIncome * (country.taxRate / 100)
  const propertyTax = player.assets
    .filter((a: any) => a.type === 'housing')
    .reduce((sum: number, a: any) => sum + a.currentValue * 0.00125, 0)

  const taxes: TaxesBreakdown = {
    income: Math.round(incomeTax),
    business: 0,
    capital: 0,
    property: Math.round(propertyTax),
    total: Math.round(incomeTax + propertyTax),
  }

  const netIncome = totalIncome - taxes.total

  const breakdown = params.expensesBreakdown || {
    food: params.lifestyleExpenses || 0,
    housing: 0,
    transport: 0,
    credits: debtInterest,
    mortgage: 0,
    other: familyExpenses,
  }

  const expenses: ExpensesBreakdown = {
    living: Math.round(breakdown.food + breakdown.housing + breakdown.transport + breakdown.other),
    food: Math.round(breakdown.food),
    housing: Math.round(breakdown.housing),
    transport: Math.round(breakdown.transport),
    credits: Math.round(breakdown.credits),
    mortgage: Math.round(breakdown.mortgage),
    other: Math.round(breakdown.other),
    family: Math.round(familyExpenses),
    business: 0,
    debtInterest: Math.round(debtInterest),
    assetMaintenance: Math.round(assetMaintenance),
    total: Math.round(
      breakdown.food +
        breakdown.housing +
        breakdown.transport +
        breakdown.other +
        debtInterest +
        assetMaintenance,
    ),
  }

  const netProfit = netIncome - expenses.total

  return {
    income,
    expenses,
    taxes,
    netProfit: Math.round(netProfit),
    warning: netProfit < 0 ? 'Вы теряете деньги!' : null,
  }
}
