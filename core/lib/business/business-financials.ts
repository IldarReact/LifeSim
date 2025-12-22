import {
  getInflatedPrice,
  getQuarterlyInflatedSalary,
  getInflatedSalary,
} from '../calculations/price-helpers'
import { calculateTotalBusinessImpact } from './business-impacts'
import { checkMinimumStaffing } from './player-roles'

import { calculateEmployeeKPI } from './employee-calculations'
import { calculatePlayerRoleEffects } from './player-roles'
import { calculateEfficiency, calculateReputation } from './business-metrics'

import type { Skill } from '../../types/skill.types'
import type { Business, BusinessInventory } from '../../types/business.types'
import type { CountryEconomy } from '../../types/economy.types'
import type { StatEffect } from '../../types/stats.types'

/**
 * Рассчитывает детальные финансовые показатели бизнеса за квартал
 */
export function calculateBusinessFinancials(
  business: Business,
  isPreview: boolean = false,
  playerSkills?: Skill[],
  globalMarketValue: number = 1.0, // ✅ НОВОЕ: глобальное состояние рынка
  economy?: CountryEconomy, // ✅ НОВОЕ: экономика для инфляции
): {
  income: number
  expenses: number
  profit: number
  netProfit: number
  cashFlow: number
  newInventory: BusinessInventory
  playerStatEffects: StatEffect
  debug?: {
    salesVolume: number
    priceUsed: number
    taxAmount: number
    opEx: number
    cogs: number
    grossProfit: number
  }
} {
  const state = business.state ?? 'active'
  if (state !== 'active') {
    const fixedExpenses = business.quarterlyExpenses
    return {
      income: 0,
      expenses: fixedExpenses,
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

  // 1. Base Expenses (OpEx)
  let employeesCost = (business.employees || []).reduce((sum, emp) => {
    // We assume emp.salary is monthly. Convert to quarterly with inflation.
    const monthlySalary = typeof emp.salary === 'number' && !isNaN(emp.salary) ? emp.salary : 0
    const indexedMonthlySalary = economy
      ? getInflatedSalary(monthlySalary, economy, emp.experience)
      : monthlySalary

    // KPI is also monthly
    const effortFactor = (emp.effortPercent ?? 100) / 100
    const scaledMonthlySalary = indexedMonthlySalary * effortFactor
    const monthlyKpi = calculateEmployeeKPI({ ...emp, salary: scaledMonthlySalary })

    return sum + (scaledMonthlySalary + monthlyKpi) * 3
  }, 0)

  // Add player salary if they are employed in their own business
  if (business.playerEmployment) {
    const monthlySalary = business.playerEmployment.salary
    const indexedMonthlySalary = economy
      ? getInflatedSalary(monthlySalary, economy, business.playerEmployment.experience || 0)
      : monthlySalary

    const effortFactor = (business.playerEmployment.effortPercent ?? 100) / 100
    employeesCost += indexedMonthlySalary * effortFactor * 3
  }

  // Calculate consolidated impacts
  const impacts = calculateTotalBusinessImpact(business, playerSkills)

  // Player Skill reduction
  // (Now included in impacts.expenseReductionPct, etc.)

  // Calculate current efficiency and reputation for financial logic
  // If preview, we calculate them on the fly to reflect changes in staff/roles
  const currentEfficiency = isPreview
    ? calculateEfficiency(business, playerSkills)
    : business.efficiency
  const currentReputation = isPreview
    ? calculateReputation(business, currentEfficiency, playerSkills)
    : business.reputation

  const baseRentPerEmployee = 200
  const baseUtilitiesPerEmployee = 50

  const rent = economy
    ? getInflatedPrice(baseRentPerEmployee * business.maxEmployees, economy, 'services')
    : baseRentPerEmployee * business.maxEmployees

  const utilities = economy
    ? getInflatedPrice(baseUtilitiesPerEmployee * business.maxEmployees, economy, 'services')
    : baseUtilitiesPerEmployee * business.maxEmployees

  const insurance = business.hasInsurance ? business.insuranceCost || 0 : 0

  let opEx = employeesCost + rent + utilities + insurance

  // Apply expense reduction (Lawyers etc.)
  if (impacts.expenseReductionPct > 0) {
    opEx *= 1 - impacts.expenseReductionPct / 100
  }

  // 2. Sales & COGS
  let salesIncome = 0
  let cogs = 0 // Cost of Goods Sold
  let salesVolume = 0
  let purchaseCost = 0 // Cost of new inventory purchased
  let purchaseAmount = 0

  const inventory = business.inventory

  if (business.isServiceBased) {
    // === SERVICE BUSINESS ===
    // Price is abstract (1-10 scale usually)
    const priceLevel =
      typeof business.price === 'number' && !isNaN(business.price) ? business.price : 5
    const baseServiceDemand = (business.maxEmployees || 1) * 10

    // Demand Modifiers
    const efficiencyMod = (currentEfficiency || 0) / 100
    const reputationMod = (currentReputation || 0) / 100
    const priceMod = 1 / Math.max(0.1, priceLevel / 5) // Normalized around 5

    // Cycle Effect
    let cycleMod =
      typeof globalMarketValue === 'number' && !isNaN(globalMarketValue) ? globalMarketValue : 1.0
    // In recession (value < 1.0), high prices hurt more
    if (cycleMod < 0.9 && priceLevel > 6) {
      cycleMod *= 0.6 // High price services suffer in crisis
    }

    const staffing = checkMinimumStaffing(business)
    let serviceDemand = staffing.isValid
      ? baseServiceDemand * efficiencyMod * reputationMod * priceMod * cycleMod
      : 0

    if (isNaN(serviceDemand)) serviceDemand = 0

    if (impacts.salesBonusPct > 0) {
      serviceDemand *= 1 + impacts.salesBonusPct / 100
    }

    const pricePerService = 1000 * priceLevel // Base revenue per service
    salesIncome = Math.floor(serviceDemand * pricePerService)
    if (isNaN(salesIncome)) salesIncome = 0
    // Service business has no COGS in this model, only OpEx
  } else if (inventory) {
    // === PRODUCT BUSINESS ===
    const sellingPrice =
      typeof inventory.pricePerUnit === 'number' && !isNaN(inventory.pricePerUnit)
        ? inventory.pricePerUnit
        : 100
    const unitCost =
      typeof inventory.purchaseCost === 'number' && !isNaN(inventory.purchaseCost)
        ? inventory.purchaseCost
        : 50

    const margin = sellingPrice - unitCost
    const marginPercent = sellingPrice > 0 ? margin / sellingPrice : 0

    let workersCount = (business.employees || []).filter((e) => e.role === 'worker').length
    // Игрок тоже может быть работником
    if (business.playerRoles?.operationalRole === 'worker') {
      workersCount += 1
    }
    const baseDemand = workersCount * 50
    const efficiencyMod = (currentEfficiency || 0) / 100
    const reputationMod = (currentReputation || 0) / 100

    // Demand Elasticity & Cycle
    let marketMod =
      typeof globalMarketValue === 'number' && !isNaN(globalMarketValue) ? globalMarketValue : 1.0

    // Crisis Logic:
    // If Recession (market < 0.9)
    if (marketMod < 0.9) {
      if (marginPercent < 0.3) {
        // Low margin / Cheap goods -> Demand is resilient or even grows
        marketMod = Math.max(marketMod, 1.0)
      } else if (marginPercent > 0.6) {
        // High margin / Luxury -> Demand crashes
        marketMod *= 0.5
      }
    }

    // Price Elasticity (General)
    // Stronger non-linear elasticity so higher price reduces demand enough to lower revenue
    const validMarginPercent = isNaN(marginPercent) ? 0.3 : marginPercent
    const baseElasticity = Math.max(0.1, 1 - (validMarginPercent - 0.3)) // 30% margin is neutral
    const priceElasticity = Math.max(0.1, baseElasticity * baseElasticity)

    let finalDemand = baseDemand * efficiencyMod * reputationMod * marketMod * priceElasticity
    if (isNaN(finalDemand)) finalDemand = 0

    if (impacts.salesBonusPct > 0) {
      finalDemand *= 1 + impacts.salesBonusPct / 100
    }

    if (!isPreview) {
      const demandFluctuation = 0.9 + Math.random() * 0.2
      finalDemand *= demandFluctuation
    }

    const staffing2 = checkMinimumStaffing(business)
    const computedDemand = staffing2.isValid ? finalDemand : 0
    const currentStock =
      typeof inventory.currentStock === 'number' && !isNaN(inventory.currentStock)
        ? inventory.currentStock
        : 0

    salesVolume = Math.min(Math.floor(isNaN(computedDemand) ? 0 : computedDemand), currentStock)
    salesIncome = salesVolume * sellingPrice
    cogs = salesVolume * unitCost

    // Restock Logic
    if (inventory.autoPurchaseAmount > 0) {
      purchaseAmount = inventory.autoPurchaseAmount
    } else {
      const hasPlan =
        typeof business.quantity === 'number' &&
        Number.isFinite(business.quantity) &&
        business.quantity >= 0
      const targetStock = hasPlan ? business.quantity : inventory.maxStock || 1000
      purchaseAmount = Math.max(0, targetStock - (currentStock - salesVolume))
    }
    purchaseCost = purchaseAmount * unitCost
  }

  // 3. Profit & Taxes
  // Gross Profit = Sales - COGS - OpEx
  // Note: purchaseCost is cash flow, not P&L expense (technically).
  // But in this simple model, we might treat purchase as expense OR use COGS.
  // Standard accounting: Profit = Sales - COGS - OpEx.
  // Cash Flow = Sales - OpEx - PurchaseCost.
  // The user asked for "quantity sold * margin = profit".
  // Margin = Price - Cost. So Sales * Margin = Sales * (Price - Cost) = Sales - COGS.
  // So GrossProfit = Sales - COGS.
  // NetProfit = GrossProfit - OpEx - Tax.

  const grossProfit = salesIncome - cogs - opEx

  let taxAmount = 0
  if (grossProfit > 0) {
    let taxRate = business.taxRate || 0.15
    if (impacts.taxReductionPct > 0) {
      taxRate *= 1 - impacts.taxReductionPct / 100
    }
    taxAmount = Math.round(grossProfit * taxRate)
  }

  // Net Profit (Accounting)
  const netProfit = grossProfit - taxAmount

  // Cash Flow (for money update)
  // Cash Change = Sales - OpEx - Tax - NewInventoryPurchases
  const cashFlow = salesIncome - opEx - taxAmount - purchaseCost

  if (!isPreview) {
    console.log(`[Business Math] ${business.name}:`, {
      salesIncome,
      cogs,
      opEx,
      grossProfit,
      taxAmount,
      netProfit,
      cashFlow,
      margin: inventory ? inventory.pricePerUnit - inventory.purchaseCost : 'N/A',
      sold: salesVolume,
    })
  }

  const newInventory: BusinessInventory = inventory
    ? {
        ...inventory,
        currentStock: Math.max(
          0,
          Math.min(
            typeof inventory.maxStock === 'number' && !isNaN(inventory.maxStock)
              ? inventory.maxStock
              : 1000,
            (typeof inventory.currentStock === 'number' && !isNaN(inventory.currentStock)
              ? inventory.currentStock
              : 0) -
              (isNaN(salesVolume) ? 0 : salesVolume) +
              (isNaN(purchaseAmount) ? 0 : purchaseAmount),
          ),
        ),
      }
    : {
        currentStock: 0,
        maxStock: 1000,
        pricePerUnit: 100,
        purchaseCost: 50,
        autoPurchaseAmount: 0,
      }

  return {
    income: Math.round(isNaN(salesIncome) ? 0 : salesIncome),
    expenses: Math.round(
      (isNaN(purchaseCost) ? 0 : purchaseCost) +
        (isNaN(opEx) ? 0 : opEx) +
        (isNaN(taxAmount) ? 0 : taxAmount),
    ), // Cash accounting: Use purchaseCost instead of COGS
    profit: Math.round(isNaN(cashFlow) ? 0 : cashFlow),
    netProfit: Math.round(isNaN(netProfit) ? 0 : netProfit),
    cashFlow: Math.round(isNaN(cashFlow) ? 0 : cashFlow),
    newInventory,
    playerStatEffects: calculatePlayerRoleEffects(business),
    debug: {
      salesVolume: isNaN(salesVolume) ? 0 : salesVolume,
      priceUsed: inventory
        ? typeof inventory.pricePerUnit === 'number' && !isNaN(inventory.pricePerUnit)
          ? inventory.pricePerUnit
          : 100
        : 0,
      taxAmount: isNaN(taxAmount) ? 0 : taxAmount,
      opEx: Math.round(isNaN(opEx) ? 0 : opEx),
      cogs: Math.round(isNaN(cogs) ? 0 : cogs),
      grossProfit: Math.round(isNaN(grossProfit) ? 0 : grossProfit),
    },
  }
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
