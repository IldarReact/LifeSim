import type { Business, BusinessInventory } from '../../../types/business.types'
import { BUSINESS_BALANCE } from '../../data-loaders/business-balance-loader'
import { checkMinimumStaffing } from '../player-roles'

export interface RevenueResult {
  salesIncome: number
  cogs: number
  salesVolume: number
  purchaseCost: number
  purchaseAmount: number
  productionCapacity: number
  sellingPrice: number
  unitCost: number
  marketDemand: number
  newInventory?: BusinessInventory
}

export function calculateRevenue(
  business: Business,
  currentEfficiency: number,
  currentReputation: number,
  globalMarketValue: number,
  salesBonusPct: number,
  isPreview: boolean,
): RevenueResult {
  const { production, elasticity } = BUSINESS_BALANCE
  const inventory = business.inventory

  if (business.isServiceBased) {
    return calculateServiceRevenue(
      business,
      currentEfficiency,
      currentReputation,
      globalMarketValue,
      salesBonusPct,
    )
  } else if (inventory) {
    return calculateProductRevenue(
      business,
      inventory,
      currentEfficiency,
      currentReputation,
      globalMarketValue,
      salesBonusPct,
      isPreview,
    )
  }

  return {
    salesIncome: 0,
    cogs: 0,
    salesVolume: 0,
    purchaseCost: 0,
    purchaseAmount: 0,
    productionCapacity: 0,
    sellingPrice: 0,
    unitCost: 0,
    marketDemand: 0,
  }
}

function calculateServiceRevenue(
  business: Business,
  currentEfficiency: number,
  currentReputation: number,
  globalMarketValue: number,
  salesBonusPct: number,
): RevenueResult {
  const { production, elasticity } = BUSINESS_BALANCE

  const priceLevel =
    typeof business.price === 'number' && !isNaN(business.price) ? business.price : 5
  const baseServiceDemand = (business.maxEmployees || 1) * production.baseServiceDemandPerMaxEmp

  const efficiencyMod = (isNaN(currentEfficiency) ? 0 : currentEfficiency) / 100
  const reputationMod = (isNaN(currentReputation) ? 0 : currentReputation) / 100

  const normalizedPrice = Math.max(0.1, priceLevel / 5)
  const effectiveSafeThreshold =
    elasticity.safePriceThreshold + reputationMod * elasticity.reputationSafetyBonus

  let priceMod = 1.0
  if (normalizedPrice > effectiveSafeThreshold) {
    priceMod = Math.pow(effectiveSafeThreshold / normalizedPrice, elasticity.demandExponent)
  }

  let cycleMod =
    typeof globalMarketValue === 'number' && !isNaN(globalMarketValue) ? globalMarketValue : 1.0
  if (cycleMod < 0.9 && priceLevel > 6) {
    cycleMod *= 0.6
  }

  const staffingCheck = checkMinimumStaffing(business)
  const staffingMod = staffingCheck.isValid ? 1 : 0.2

  let serviceDemand =
    baseServiceDemand *
    efficiencyMod *
    Math.max(0.1, reputationMod) *
    priceMod *
    cycleMod *
    staffingMod
  if (isNaN(serviceDemand)) serviceDemand = 0

  const marketDemand = serviceDemand
  if (salesBonusPct > 0) {
    serviceDemand *= 1 + salesBonusPct / 100
  }

  const sellingPrice = production.baseServiceRevenuePerLevel * priceLevel
  const salesVolume = Math.floor(serviceDemand)
  const salesIncome = Math.floor(serviceDemand * sellingPrice)

  return {
    salesIncome: isNaN(salesIncome) ? 0 : salesIncome,
    cogs: 0,
    salesVolume,
    purchaseCost: 0,
    purchaseAmount: 0,
    productionCapacity: 0,
    sellingPrice,
    unitCost: 0,
    marketDemand,
  }
}

function calculateProductRevenue(
  business: Business,
  inventory: BusinessInventory,
  currentEfficiency: number,
  currentReputation: number,
  globalMarketValue: number,
  salesBonusPct: number,
  isPreview: boolean,
): RevenueResult {
  const { production, elasticity } = BUSINESS_BALANCE

  const unitCost =
    typeof inventory.purchaseCost === 'number' && !isNaN(inventory.purchaseCost)
      ? inventory.purchaseCost
      : 50
  const priceLevel =
    typeof business.price === 'number' && !isNaN(business.price) ? business.price : 5
  const normalizedPrice = priceLevel * 0.5

  let sellingPrice = 0
  const rawPricePerUnit = inventory.pricePerUnit
  if (typeof rawPricePerUnit === 'number' && !isNaN(rawPricePerUnit)) {
    sellingPrice = rawPricePerUnit === 0 ? 0 : Math.round(unitCost * normalizedPrice)
  } else if (isNaN(rawPricePerUnit)) {
    sellingPrice = 100
  } else {
    sellingPrice = Math.round(unitCost * normalizedPrice)
  }

  // 1. Production
  let workersCount = (business.employees || []).filter((e) => e.role === 'worker').length
  if (business.playerRoles?.operationalRole === 'worker') {
    workersCount += 1
  }

  const efficiencyMod = (isNaN(currentEfficiency) ? 0 : currentEfficiency) / 100
  const reputationMod = (isNaN(currentReputation) ? 0 : currentReputation) / 100

  const productionCapacity = Math.floor(
    (workersCount + 0.5) * production.baseProductionPerWorker * efficiencyMod,
  )
  const planProduction =
    typeof business.quantity === 'number' && !isNaN(business.quantity) ? business.quantity : 0
  const actualProduction = Math.min(
    planProduction,
    isNaN(productionCapacity) ? 0 : productionCapacity,
  )

  const purchaseAmount = actualProduction
  const purchaseCost = actualProduction * unitCost

  // 2. Demand
  const baseDemand = (business.maxEmployees || 1) * production.baseProductDemandPerMaxEmp
  const marketMod =
    typeof globalMarketValue === 'number' && !isNaN(globalMarketValue) ? globalMarketValue : 1.0
  const reputationEffect = Math.max(0.1, reputationMod)

  const effectiveSafeThreshold =
    elasticity.safePriceThreshold + reputationMod * elasticity.reputationSafetyBonus
  const currentMarkup = sellingPrice / Math.max(1, unitCost) - 1

  let priceMod = 1.0
  if (currentMarkup > effectiveSafeThreshold && currentMarkup > 0) {
    priceMod = Math.pow(effectiveSafeThreshold / currentMarkup, elasticity.demandExponent)
  }

  if (marketMod < 0.9) {
    if (currentMarkup >= 0.6) priceMod *= 0.7
    else if (currentMarkup <= 0.3) priceMod *= 1.1
  }

  let finalDemand = baseDemand * reputationEffect * marketMod * priceMod
  if (isNaN(finalDemand)) finalDemand = 0
  const marketDemand = finalDemand

  if (salesBonusPct > 0) {
    finalDemand *= 1 + salesBonusPct / 100
  }

  if (!isPreview) {
    finalDemand *= 0.9 + Math.random() * 0.2
  }

  // 3. Sales
  const stock =
    typeof inventory.currentStock === 'number' && !isNaN(inventory.currentStock)
      ? inventory.currentStock
      : 0
  const totalAvailable = stock + actualProduction
  const salesVolume = Math.min(totalAvailable, Math.floor(finalDemand))

  const salesIncome = salesVolume * sellingPrice
  const cogs = salesVolume * unitCost

  // 4. Inventory Update
  const remainingStock = Math.max(0, totalAvailable - salesVolume)
  const maxStock =
    typeof inventory.maxStock === 'number' && !isNaN(inventory.maxStock) ? inventory.maxStock : 1000

  const newInventory: BusinessInventory = {
    ...inventory,
    currentStock: Math.min(remainingStock, maxStock),
  }

  return {
    salesIncome: isNaN(salesIncome) ? 0 : salesIncome,
    cogs: isNaN(cogs) ? 0 : cogs,
    salesVolume: isNaN(salesVolume) ? 0 : salesVolume,
    purchaseCost: Math.round(purchaseCost),
    purchaseAmount,
    productionCapacity: isNaN(productionCapacity) ? 0 : productionCapacity,
    sellingPrice,
    unitCost,
    marketDemand,
    newInventory,
  }
}
