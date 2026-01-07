import { calculateQuarterlyTaxes } from '../calculate-quarterly-taxes'
import { getInflatedPrice } from '../price-helpers'
import { sanitizeNumber } from '../financial-helpers'

import type { Player, QuarterlyReport, IncomeBreakdown } from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'

export function calculateMixedQuarterlyReport(params: {
  player: Player
  country: CountryEconomy
  familyIncome: number
  familyExpenses: number
  assetIncome: number
  assetMaintenance: number
  debtInterest: number
  buffIncomeMod: number
  businessFinancialsOverride?: { income: number; expenses: number; taxes: number }
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
    businessFinancialsOverride,
  } = params

  const familyIncome = sanitizeNumber(rawFamilyIncome)
  const familyExpenses = sanitizeNumber(rawFamilyExpenses)
  const assetIncome = sanitizeNumber(rawAssetIncome)
  const assetMaintenance = sanitizeNumber(rawAssetMaintenance)
  const debtInterest = sanitizeNumber(rawDebtInterest)
  const buffIncomeMod = sanitizeNumber(rawBuffIncomeMod)

  let businessRevenue = 0
  let businessExpenses = 0
  let businessTaxes = 0
  let businessSalary = 0

  // 1. Collect business data
  if (businessFinancialsOverride) {
    businessRevenue = sanitizeNumber(businessFinancialsOverride.income)
    businessExpenses = sanitizeNumber(businessFinancialsOverride.expenses)
    businessTaxes = sanitizeNumber(businessFinancialsOverride.taxes)
  } else {
    // Fallback if no override (e.g. initial UI render before first turn)
    // We don't want to re-calculate everything here if we can avoid it,
    // but if we must, we do it once.
    player.businesses.forEach((b) => {
      const sharePct = typeof b.playerShare === 'number' ? b.playerShare : 100
      const shareFactor = Math.max(0, Math.min(100, sharePct)) / 100

      businessRevenue += Math.round(sanitizeNumber(b.quarterlyIncome) * shareFactor)
      businessExpenses += Math.round(sanitizeNumber(b.quarterlyExpenses) * shareFactor)
      businessTaxes += Math.round(sanitizeNumber(b.quarterlyTax) * shareFactor)
    })
  }

  // Calculate player's salary from businesses for personal tax
  // This should always be calculated from current business state to be accurate
  businessSalary = player.businesses.reduce((sum, b) => {
    const pEmp = b.playerEmployment
    if (!pEmp) return sum
    // Salary is paid in full to the employee, regardless of their ownership share
    return sum + Math.round(sanitizeNumber(pEmp.salary))
  }, 0)

  const baseSalary = (player.jobs || []).reduce((sum: number, job) => {
    const monthlySalary = sanitizeNumber(job.salary)
    // Применить инфляцию к зарплате
    const inflatedMonthlySalary = getInflatedPrice(monthlySalary, country, 'salaries')
    return sum + inflatedMonthlySalary * 3
  }, 0)

  // Total personal income from work (external jobs + own business salary)
  const workSalary = (baseSalary + businessSalary) * (1 + buffIncomeMod / 100)
  const adjustedBusinessRevenue = businessRevenue * (1 + buffIncomeMod / 100)

  // Taxable income for personal taxes should only include business PROFIT, not gross REVENUE
  const businessProfit = Math.max(0, adjustedBusinessRevenue - businessExpenses - businessTaxes)
  const taxableIncome = workSalary + businessProfit + familyIncome + assetIncome

  // Total income for net profit calculation
  // NOTE: businessRevenue already includes the business expenses and taxes in the flow
  const totalIncome = workSalary + adjustedBusinessRevenue + familyIncome + assetIncome

  const income: IncomeBreakdown = {
    salary: workSalary,
    businessRevenue: adjustedBusinessRevenue,
    familyIncome,
    assetIncome,
    capitalGains: 0,
    total: totalIncome,
  }

  // Базовые расходы на жизнь с инфляцией (категория services)
  const baseLifestyleCost = 1000 * 3 * (country.costOfLivingModifier || 1.0)
  const baseLiving = getInflatedPrice(baseLifestyleCost, country, 'services')

  const breakdown = params.expensesBreakdown || {
    food: sanitizeNumber(params.lifestyleExpenses),
    housing: 0,
    transport: 0,
    credits: debtInterest,
    mortgage: 0,
    other: familyExpenses,
  }

  const expensesTotal = Math.round(
    baseLiving +
      sanitizeNumber(breakdown.food) +
      sanitizeNumber(breakdown.housing) +
      sanitizeNumber(breakdown.transport) +
      sanitizeNumber(breakdown.other) +
      familyExpenses +
      businessExpenses +
      debtInterest +
      assetMaintenance,
  )

  // Centralized tax calculation
  const personalTaxes = calculateQuarterlyTaxes({
    income: taxableIncome,
    assets: player.assets || [],
    country,
  })

  const taxes = {
    income: personalTaxes.income,
    business: Math.round(businessTaxes), // Corporate tax from businesses
    capital: personalTaxes.capital,
    property: personalTaxes.property,
    total: Math.round(personalTaxes.total + businessTaxes),
  }

  const netProfit = totalIncome - expensesTotal - taxes.total

  return {
    income,
    expenses: {
      living: Math.round(
        baseLiving +
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
      family: Math.round(familyExpenses),
      business: Math.round(businessExpenses),
      debtInterest: Math.round(debtInterest),
      assetMaintenance: Math.round(assetMaintenance),
      total: expensesTotal,
    },
    taxes,
    netProfit: Math.round(sanitizeNumber(netProfit)),
    warning: netProfit < 0 ? 'Вы теряете деньги!' : null,
  }
}
