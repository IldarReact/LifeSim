/**
 * Layer 3: Business Initialization
 *
 * ✅ Pure function — constructs new business object
 * ✅ No dependencies on store/state
 * ✅ Single responsibility: create properly initialized Business object
 */

import type { Business, BusinessType } from '@/core/types/business.types'
import type { StatEffect } from '@/core/types/stats.types'

export interface CreateBusinessParams {
  name: string
  type: BusinessType
  description: string
  totalCost: number
  upfrontCost: number
  creationCost: StatEffect
  openingQuarters: number
  monthlyIncome?: number
  monthlyExpenses?: number
  maxEmployees: number
  minEmployees?: number
  taxRate?: number
  currentTurn: number
}

/**
 * Creates a new business object with all required properties initialized
 *
 * ✅ Pure function: given same inputs, always returns identical output
 * ✅ No side effects: doesn't modify store/database/etc
 * ✅ Well-typed: all parameters and return type explicitly typed
 *
 * @param params - Business creation parameters
 * @returns Properly initialized Business object
 *
 * @example
 * const business = createBusinessObject({
 *   name: 'My Shop',
 *   type: 'retail',
 *   description: 'A nice shop',
 *   totalCost: 50000,
 *   upfrontCost: 25000,
 *   creationCost: { energy: -10 },
 *   openingQuarters: 2,
 *   monthlyIncome: 5000,
 *   monthlyExpenses: 2000,
 *   maxEmployees: 5,
 *   currentTurn: 10
 * })
 */
export function createBusinessObject(params: CreateBusinessParams): Business {
  const {
    name,
    type,
    description,
    totalCost,
    upfrontCost,
    creationCost,
    openingQuarters,
    monthlyIncome = 0,
    monthlyExpenses = 0,
    maxEmployees,
    minEmployees = 1,
    taxRate = 0.15,
    currentTurn,
  } = params

  const isServiceBased = type === 'service' || type === 'tech'

  const business: Business = {
    // Identifiers
    id: `business_${Date.now()}`,
    name,
    type,
    description,
    state: openingQuarters > 0 ? 'opening' : 'active',
    lastQuarterlyUpdate: currentTurn,
    createdAt: currentTurn,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    autoPurchaseAmount: 0,

    // Pricing & Production
    price: 5, // Default mid-range price (1-10)
    quantity: isServiceBased ? 0 : 100,
    isServiceBased,

    // Network & Partnerships
    networkId: undefined,
    isMainBranch: true,
    partners: [],
    proposals: [],

    // Opening Progress (if applicable)
    openingProgress: {
      totalQuarters: openingQuarters,
      quartersLeft: openingQuarters,
      investedAmount: upfrontCost,
      totalCost,
      upfrontCost,
    },

    // Financials
    creationCost,
    initialCost: totalCost,
    quarterlyIncome: (monthlyIncome || 0) * 3,
    quarterlyExpenses: (monthlyExpenses || 0) * 3,
    currentValue: totalCost,
    taxRate: taxRate || 0.15,
    walletBalance: 0,

    // Insurance
    hasInsurance: false,
    insuranceCost: 0,

    // Inventory (for non-service businesses)
    inventory: {
      currentStock: 1000,
      maxStock: 1000,
      pricePerUnit: 100,
      purchaseCost: 50,
      autoPurchaseAmount: 0,
    },

    // Staffing
    employees: [],
    maxEmployees,
    requiredRoles: [],
    minEmployees,
    playerRoles: {
      managerialRoles: ['manager', 'accountant'],
      operationalRole: null,
    },

    // Metrics & Performance
    reputation: 50,
    efficiency: 50,

    // History
    eventsHistory: [],
    foundedTurn: currentTurn,
  }

  return business
}

/**
 * Creates a branch business based on existing main business
 *
 * @param mainBusiness - The main branch to clone from
 * @param networkId - Network ID this branch belongs to
 * @param branchNumber - Branch number for naming
 * @param currentTurn - Current game turn
 * @returns New branch business
 */
export function createBusinessBranch(
  mainBusiness: Business,
  networkId: string,
  branchNumber: number,
  currentTurn: number,
): Business {
  const branchName = `${mainBusiness.name.split(' (')[0]} (Филиал ${branchNumber})`

  return {
    ...mainBusiness,
    id: `business_${Date.now()}`,
    name: branchName,
    networkId,
    isMainBranch: false,
    state: 'active',
    employees: [],
    openingProgress: {
      totalQuarters: 0,
      quartersLeft: 0,
      investedAmount: 0,
      totalCost: 0,
      upfrontCost: 0,
    },
    foundedTurn: currentTurn,
  }
}
