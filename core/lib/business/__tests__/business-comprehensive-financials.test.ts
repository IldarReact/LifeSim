import { describe, it, expect } from 'vitest'

import { calculateBusinessFinancials } from '../business-financials'

import type { Business } from '@/core/types'

describe('Business Comprehensive Financials', () => {
  const mockEconomy: any = {
    id: 'us',
    name: 'USA',
    archetype: 'rich_stable',
    inflation: 10,
    inflationHistory: [10, 10], // Two years of 10% inflation
    taxRate: 20,
    corporateTaxRate: 20,
    keyRate: 5,
    unemployment: 5,
    salaryModifier: 1.0,
    costOfLivingModifier: 1.0,
    activeEvents: [],
    gdpGrowth: 2,
    stockMarketInflation: 5,
  }

  const mockBusiness: Business = {
    id: 'test-biz',
    name: 'Test Retail',
    type: 'retail',
    description: 'Test',
    state: 'active',
    price: 5, // 2.5x multiplier
    quantity: 100,
    isServiceBased: false,
    isMainBranch: true,
    partners: [],
    proposals: [],
    lastQuarterlyUpdate: 0,
    createdAt: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    autoPurchaseAmount: 0,
    initialCost: 10000,
    quarterlyIncome: 0,
    quarterlyExpenses: 0,
    quarterlyTax: 0,
    currentValue: 20000,
    employees: [],
    maxEmployees: 5,
    minEmployees: 1,
    reputation: 50,
    efficiency: 100,
    taxRate: 20,
    hasInsurance: false,
    insuranceCost: 0,
    creationCost: { energy: 0, money: 0 },
    playerRoles: { managerialRoles: [], operationalRole: 'worker' },
    employeeRoles: [],
    inventory: {
      currentStock: 100,
      maxStock: 500,
      pricePerUnit: 50,
      purchaseCost: 20,
      autoPurchaseAmount: 0,
    },
    openingProgress: {
      totalQuarters: 0,
      quartersLeft: 0,
      investedAmount: 0,
      totalCost: 0,
      upfrontCost: 0,
    },
    eventsHistory: [],
    foundedTurn: 1,
  }

  describe('Price Scaling (10 = 5x)', () => {
    it('should apply 5x multiplier when price level is 10', () => {
      const biz = {
        ...mockBusiness,
        price: 10,
        inventory: { ...mockBusiness.inventory!, purchaseCost: 100 },
      }
      const result = calculateBusinessFinancials(biz, true)
      // Multiplier = 10 * 0.5 = 5.0
      // sellingPrice = 100 * 5.0 = 500
      expect(result.debug?.priceUsed).toBe(500)
    })

    it('should apply 0.5x multiplier when price level is 1', () => {
      const biz = {
        ...mockBusiness,
        price: 1,
        inventory: { ...mockBusiness.inventory!, purchaseCost: 100 },
      }
      const result = calculateBusinessFinancials(biz, true)
      // Multiplier = 1 * 0.5 = 0.5
      // sellingPrice = 100 * 0.5 = 50
      expect(result.debug?.priceUsed).toBe(50)
    })
  })

  describe('Lifecycle Management', () => {
    it('should return zero income and limited expenses when frozen', () => {
      const frozenBiz = { ...mockBusiness, state: 'frozen' as const, quarterlyExpenses: 500 }
      const result = calculateBusinessFinancials(frozenBiz)

      expect(result.income).toBe(0)
      expect(result.expenses).toBe(500)
      expect(result.profit).toBe(-500)
    })
  })

  describe('Financial Synchronization', () => {
    it('should provide a correct expenses breakdown for UI', () => {
      const result = calculateBusinessFinancials(mockBusiness, true)
      const breakdown = result.debug?.expensesBreakdown

      expect(breakdown).toBeDefined()
      expect(breakdown?.rent).toBe(150 * 5) // baseRentPerEmployee * maxEmployees
      expect(breakdown?.equipment).toBe(30 * 5) // baseUtilitiesPerEmployee * maxEmployees
    })
  })
})
