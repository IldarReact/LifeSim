import { calculateQuarterlyTaxes } from '../calculate-quarterly-taxes'
import { getInflatedPrice } from '../price-helpers'
import { sanitizeNumber } from '../financial-helpers'

import type {
  Player,
  QuarterlyReport,
  IncomeBreakdown,
  ExpensesBreakdown,
  TaxesBreakdown,
} from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'

export function calculateEmployeeQuarterlyReport(params: {
  player: Player
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
    familyIncome: rawFamilyIncome,
    familyExpenses: rawFamilyExpenses,
    assetIncome: rawAssetIncome,
    assetMaintenance: rawAssetMaintenance,
    debtInterest: rawDebtInterest,
    buffIncomeMod: rawBuffIncomeMod,
  } = params

  const familyIncome = sanitizeNumber(rawFamilyIncome)
  const familyExpenses = sanitizeNumber(rawFamilyExpenses)
  const assetIncome = sanitizeNumber(rawAssetIncome)
  const assetMaintenance = sanitizeNumber(rawAssetMaintenance)
  const debtInterest = sanitizeNumber(rawDebtInterest)
  const buffIncomeMod = sanitizeNumber(rawBuffIncomeMod)

  // Income (с инфляцией)
  const baseSalary = (player.jobs || []).reduce((sum: number, job) => {
    const monthlySalary = sanitizeNumber(job.salary)
    // Применить инфляцию к зарплате
    const inflatedMonthlySalary = getInflatedPrice(monthlySalary, country, 'salaries')
    return sum + inflatedMonthlySalary * 3
  }, 0)
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

  // Centralized tax calculation
  const personalTaxes = calculateQuarterlyTaxes({
    income: totalIncome,
    assets: player.assets || [],
    country,
  })

  const taxes: TaxesBreakdown = {
    income: personalTaxes.income,
    business: 0,
    capital: personalTaxes.capital,
    property: personalTaxes.property,
    total: personalTaxes.total,
  }

  const netIncome = totalIncome - taxes.total

  const breakdown = params.expensesBreakdown || {
    food: sanitizeNumber(params.lifestyleExpenses),
    housing: 0,
    transport: 0,
    credits: debtInterest,
    mortgage: 0,
    other: familyExpenses,
  }

  const expenses: ExpensesBreakdown = {
    living: Math.round(
      sanitizeNumber(breakdown.food) +
        sanitizeNumber(breakdown.housing) +
        sanitizeNumber(breakdown.transport) +
        sanitizeNumber(breakdown.other),
    ),
    food: Math.round(sanitizeNumber(breakdown.food)),
    housing: Math.round(sanitizeNumber(breakdown.housing)),
    transport: Math.round(sanitizeNumber(breakdown.transport)),
    credits: Math.round(sanitizeNumber(breakdown.credits)),
    mortgage: Math.round(sanitizeNumber(breakdown.mortgage)),
    other: Math.round(sanitizeNumber(breakdown.other)),
    family: 0, // Deprecated
    business: 0,
    debtInterest: debtInterest,
    assetMaintenance: assetMaintenance,
    total:
      Math.round(
        sanitizeNumber(breakdown.food) +
          sanitizeNumber(breakdown.housing) +
          sanitizeNumber(breakdown.transport) +
          sanitizeNumber(breakdown.other),
      ) +
      debtInterest +
      assetMaintenance,
  }

  const netProfit = netIncome - expenses.total

  return {
    income,
    expenses,
    taxes,
    netProfit: Math.round(sanitizeNumber(netProfit)),
    warning: netProfit < 0 ? 'Вы теряете деньги!' : null,
  }
}
