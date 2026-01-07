import type { Business, BusinessInventory } from '../../types/business.types'
import type { CountryEconomy } from '../../types/economy.types'
import type { Skill } from '../../types/skill.types'
import type { StatEffect } from '../../types/stats.types'

import { calculateTotalBusinessImpact } from './business-impacts'
import { calculateEfficiency, calculateReputation } from './business-metrics'
import { calculateOpEx } from './financials/opex-calculator'
import { calculateRevenue } from './financials/revenue-calculator'
import { calculateTaxes, calculateEstimatedMonthlyProfit as _calcMonthlyProfit } from './financials/tax-calculator'
import { calculatePlayerRoleEffects } from './player-roles'

/**
 * Рассчитывает детальные финансовые показатели бизнеса за квартал
 */
export function calculateBusinessFinancials(
  business: Business,
  isPreview: boolean = false,
  playerSkills?: Skill[],
  globalMarketValue: number = 1.0,
  economy?: CountryEconomy,
): {
  income: number
  expenses: number
  taxAmount: number
  profit: number
  netProfit: number
  cashFlow: number
  newInventory: BusinessInventory
  playerStatEffects: StatEffect
  debug?: {
    productionCapacity?: number
    salesVolume: number
    marketDemand: number
    purchaseAmount: number
    purchaseCost: number
    priceUsed: number
    unitCost: number
    taxAmount: number
    opEx: number
    cogs: number
    grossProfit: number
    expensesBreakdown: {
      employees: number
      inventory: number
      marketing: number
      rent: number
      equipment: number
      other: number
    }
  }
} {
  const state = business.state ?? 'active'
  if (state !== 'active') {
    const fixedExpenses = business.quarterlyExpenses
    return {
      income: 0,
      expenses: fixedExpenses,
      taxAmount: 0,
      profit: -fixedExpenses,
      netProfit: -fixedExpenses,
      cashFlow: -fixedExpenses,
      newInventory: business.inventory || {
        currentStock: 0,
        maxStock: 1000,
        pricePerUnit: 100,
        purchaseCost: 50,
        autoPurchaseAmount: 0,
      },
      playerStatEffects: { energy: 0, sanity: 0 },
    }
  }

  // 1. Impacts & Metrics
  const impacts = calculateTotalBusinessImpact(business, playerSkills)
  const currentEfficiency = isPreview
    ? calculateEfficiency(business, playerSkills)
    : business.efficiency
  const currentReputation = isPreview
    ? calculateReputation(business, currentEfficiency, playerSkills)
    : business.reputation

  // 2. OpEx Calculation
  const opexResult = calculateOpEx(business, economy, impacts.expenseReductionPct)
  const { totalOpEx } = opexResult

  // 3. Revenue & Inventory Calculation
  const revenueResult = calculateRevenue(
    business,
    currentEfficiency,
    currentReputation,
    globalMarketValue,
    impacts.salesBonusPct,
    isPreview,
  )
  const {
    salesIncome,
    cogs,
    salesVolume,
    purchaseCost,
    purchaseAmount,
    productionCapacity,
    sellingPrice,
    unitCost,
    marketDemand,
  } = revenueResult

  const newInventory = revenueResult.newInventory || business.inventory || {
    currentStock: 0,
    maxStock: 1000,
    pricePerUnit: 100,
    purchaseCost: 50,
    autoPurchaseAmount: 0,
  }

  // 4. Profit & Taxes
  const grossProfit = salesIncome - cogs
  const ebitda = grossProfit - totalOpEx

  const taxResult = calculateTaxes(ebitda, economy?.corporateTaxRate, business.taxRate)
  const { taxAmount, netProfit } = taxResult

  // Cash Flow includes production costs (purchaseCost) and taxes
  const cashFlow = salesIncome - (totalOpEx + purchaseCost + taxAmount)

  return {
    income: Math.round(salesIncome),
    expenses: Math.round(purchaseCost + totalOpEx),
    taxAmount: Math.round(taxAmount),
    profit: Math.round(cashFlow),
    netProfit: Math.round(netProfit),
    cashFlow: Math.round(cashFlow),
    newInventory,
    playerStatEffects: calculatePlayerRoleEffects(business),
    debug: {
      productionCapacity,
      salesVolume,
      marketDemand,
      purchaseAmount,
      purchaseCost: Math.round(purchaseCost),
      priceUsed: Math.round(sellingPrice),
      unitCost: Math.round(unitCost),
      taxAmount: Math.round(taxAmount),
      opEx: Math.round(totalOpEx),
      cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      expensesBreakdown: {
        employees: opexResult.reducedEmployeesCost,
        inventory: Math.round(purchaseCost),
        marketing: 0,
        rent: opexResult.reducedRent,
        equipment: opexResult.reducedUtilities,
        other: opexResult.reducedInsurance + opexResult.minFixedCosts,
      },
    },
  }
}

/**
 * Рассчитывает примерную месячную прибыль для отображения в UI
 */
export function calculateEstimatedMonthlyProfit(
  monthlyIncome: number,
  monthlyExpenses: number,
  corporateTaxRatePercent: number = 15,
): number {
  return _calcMonthlyProfit(monthlyIncome, monthlyExpenses, corporateTaxRatePercent)
}

/**
 * Рассчитывает доход бизнеса (упрощенная версия для UI)
 */
export function calculateBusinessIncome(business: Business): number {
  const financials = calculateBusinessFinancials(business, true)
  return financials.income
}

/**
 * @deprecated Use calculateBusinessFinancials instead
 */
export function updateInventory(business: Business): BusinessInventory {
  return business.inventory
}
