import { getInflatedPrice, getQuarterlyInflatedSalary } from '../calculations/price-helpers'
import { getRoleConfig } from './employee-roles.config'

import { calculateEmployeeKPI } from './employee-calculations'
import { getPlayerRoleBusinessImpact, calculatePlayerRoleEffects } from './player-roles'

import type { Skill } from '@/core/types'
import type { Business, BusinessInventory } from '@/core/types/business.types'
import type { CountryEconomy } from '@/core/types/economy.types'
import type { StatEffect } from '@/core/types/stats.types'

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
  const employeesCost = business.employees.reduce((sum, emp) => {
    const indexedSalary = economy
      ? getQuarterlyInflatedSalary(emp.salary, economy, emp.experience)
      : emp.salary
    const kpi = calculateEmployeeKPI(emp)
    return sum + indexedSalary + kpi
  }, 0)

  const baseRentPerEmployee = 200
  const baseUtilitiesPerEmployee = 50

  const rent = economy
    ? getInflatedPrice(baseRentPerEmployee * business.maxEmployees, economy, 'services')
    : baseRentPerEmployee * business.maxEmployees

  const utilities = economy
    ? getInflatedPrice(baseUtilitiesPerEmployee * business.maxEmployees, economy, 'services')
    : baseUtilitiesPerEmployee * business.maxEmployees

  let opEx = employeesCost + rent + utilities

  // Employee role buffs
  let employeeEfficiencyBonusPct = 0
  let employeeSalesBonusPct = 0
  let employeeReputationBonusPct = 0
  let employeeTaxReductionPct = 0

  business.employees.forEach((emp) => {
    const cfg = getRoleConfig(emp.role)
    const impact = cfg?.staffImpact ? cfg.staffImpact(emp.stars) : undefined
    if (!impact) return
    if (impact.efficiencyBonus) employeeEfficiencyBonusPct += impact.efficiencyBonus
    if (impact.salesBonus) employeeSalesBonusPct += impact.salesBonus
    if (impact.reputationBonus) employeeReputationBonusPct += impact.reputationBonus
    if (impact.taxReduction) employeeTaxReductionPct += impact.taxReduction
  })

  // Player Skill reduction
  if (playerSkills && playerSkills.length > 0) {
    const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills)
    // Не сокращаем фиксированные расходы “из воздуха”
    // Эффективность/продажи/репутация учитываются ниже через спрос и доход
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
    const priceLevel = business.price || 5
    const baseServiceDemand = business.maxEmployees * 10

    // Demand Modifiers
    const efficiencyMod = (business.efficiency / 100) * (1 + employeeEfficiencyBonusPct / 100)
    const reputationMod = business.reputation / 100
    const priceMod = 1 / Math.max(0.1, priceLevel / 5) // Normalized around 5

    // Cycle Effect
    let cycleMod = globalMarketValue
    // In recession (value < 1.0), high prices hurt more
    if (globalMarketValue < 0.9 && priceLevel > 6) {
      cycleMod *= 0.6 // High price services suffer in crisis
    }

    let serviceDemand = baseServiceDemand * efficiencyMod * reputationMod * priceMod * cycleMod
    if (employeeSalesBonusPct > 0) {
      serviceDemand *= 1 + employeeSalesBonusPct / 100
    }

    if (playerSkills && playerSkills.length > 0) {
      const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills)
      serviceDemand *= 1 + playerImpact.salesBonus / 100
    }

    const pricePerService = 1000 * priceLevel // Base revenue per service
    salesIncome = Math.floor(serviceDemand * pricePerService)
    // Service business has no COGS in this model, only OpEx
  } else if (inventory) {
    // === PRODUCT BUSINESS ===
    const sellingPrice = inventory.pricePerUnit
    const unitCost = inventory.purchaseCost
    const margin = sellingPrice - unitCost
    const marginPercent = margin / sellingPrice

    const workersCount = business.employees.filter((e) => e.role === 'worker').length
    const baseDemand = workersCount * 50
    const efficiencyMod = (business.efficiency / 100) * (1 + employeeEfficiencyBonusPct / 100)
    const reputationMod = business.reputation / 100

    // Demand Elasticity & Cycle
    let marketMod = globalMarketValue

    // Crisis Logic:
    // If Recession (market < 0.9)
    if (globalMarketValue < 0.9) {
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
    const baseElasticity = Math.max(0.1, 1 - (marginPercent - 0.3)) // 30% margin is neutral
    const priceElasticity = Math.max(0.1, baseElasticity * baseElasticity)

    let finalDemand = baseDemand * efficiencyMod * reputationMod * marketMod * priceElasticity
    if (employeeSalesBonusPct > 0) {
      finalDemand *= 1 + employeeSalesBonusPct / 100
    }

    if (!isPreview) {
      const demandFluctuation = 0.9 + Math.random() * 0.2
      finalDemand *= demandFluctuation
    }

    if (playerSkills && playerSkills.length > 0) {
      const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills)
      finalDemand *= 1 + playerImpact.salesBonus / 100
    }

    salesVolume = Math.min(Math.floor(finalDemand), inventory.currentStock)
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
      const targetStock = hasPlan ? business.quantity : inventory.maxStock
      purchaseAmount = Math.max(0, targetStock - (inventory.currentStock - salesVolume))
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
    if (employeeTaxReductionPct > 0) {
      taxRate *= 1 - Math.min(0.5, employeeTaxReductionPct / 100)
    }
    if (playerSkills && playerSkills.length > 0) {
      const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills)
      if (playerImpact.taxReduction > 0) {
        taxRate *= 1 - Math.min(0.5, playerImpact.taxReduction / 100)
      }
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
          Math.min(inventory.maxStock, inventory.currentStock - salesVolume + purchaseAmount),
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
    income: Math.round(salesIncome),
    expenses: Math.round(cogs + opEx + taxAmount), // P&L Expenses (COGS + OpEx + Taxes)
    profit: Math.round(cashFlow), // We return Cash Flow as "profit" for the game money update
    netProfit: Math.round(netProfit),
    cashFlow: Math.round(cashFlow),
    newInventory,
    playerStatEffects: calculatePlayerRoleEffects(business),
    debug: {
      salesVolume,
      priceUsed: inventory ? inventory.pricePerUnit : 0,
      taxAmount,
      opEx: Math.round(opEx),
      cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
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
