import { describe, it, expect } from 'vitest'

import { calculateBusinessFinancials } from '../business-financials'

import type { Business } from '@/core/types'

describe('Business Logic Alignment (User Feedback & Refactoring)', () => {
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
    hasInsurance: true,
    insuranceCost: 1000,
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

  const mockEconomy: any = {
    id: 'us',
    name: 'USA',
    archetype: 'rich_stable',
    inflation: 50, // High inflation to test if it's IGNORED for some fields
    corporateTaxRate: 15,
  }

  describe('Simplified Inflation ("3 излишне")', () => {
    it('should NOT apply economy inflation to unit cost', () => {
      const biz = { ...mockBusiness }
      const result = calculateBusinessFinancials(biz, true, [], 1.0, mockEconomy)

      // unitCost should be exactly purchaseCost from inventory, ignoring economy.inflation
      expect(result.debug?.unitCost).toBe(20)
    })

    it('should NOT apply economy inflation to rent and utilities', () => {
      // We need to know baseRentPerEmployee and baseUtilitiesPerEmployee from BUSINESS_BALANCE
      // Assuming they are fixed values from business-balance.json
      const result1 = calculateBusinessFinancials(mockBusiness, true, [], 1.0, undefined)
      const result2 = calculateBusinessFinancials(mockBusiness, true, [], 1.0, mockEconomy)

      // Expenses breakdown for rent/equipment should be identical despite high inflation
      expect(result1.debug?.expensesBreakdown.rent).toBe(result2.debug?.expensesBreakdown.rent)
      expect(result1.debug?.expensesBreakdown.equipment).toBe(
        result2.debug?.expensesBreakdown.equipment,
      )
    })

    it('should NOT apply economy inflation to insurance cost', () => {
      const result1 = calculateBusinessFinancials(mockBusiness, true, [], 1.0, undefined)
      const result2 = calculateBusinessFinancials(mockBusiness, true, [], 1.0, mockEconomy)

      expect(result1.debug?.expensesBreakdown.other).toBe(result2.debug?.expensesBreakdown.other)
    })
  })

  describe('NaN Safety & Zero Values', () => {
    it('should handle NaN in employees salary gracefully', () => {
      const bizWithNan: Business = {
        ...mockBusiness,
        employees: [
          {
            id: 'emp-1',
            name: 'NaN Guy',
            role: 'worker',
            stars: 3,
            salary: NaN, // Dangerous!
            productivity: 100,
            experience: 0,
            humanTraits: [],
          } as any,
        ],
      }

      const result = calculateBusinessFinancials(bizWithNan, true)
      expect(result.expenses).toBeGreaterThan(0)
      expect(isNaN(result.expenses)).toBe(false)
    })

    it('should handle zero production quantity gracefully', () => {
      const bizWithZero: Business = {
        ...mockBusiness,
        quantity: 0,
      }

      const result = calculateBusinessFinancials(bizWithZero, true)
      expect(result.debug?.purchaseAmount).toBe(0)
      expect(result.debug?.purchaseCost).toBe(0)
    })
  })

  describe('Elasticity & Demand', () => {
    it('should show demand drop when price is too high', () => {
      const bizNormal = { ...mockBusiness, price: 5 } // 2.5x
      const bizHigh = { ...mockBusiness, price: 10 } // 5.0x

      const resultNormal = calculateBusinessFinancials(bizNormal, true)
      const resultHigh = calculateBusinessFinancials(bizHigh, true)

      expect(resultHigh.debug!.marketDemand).toBeLessThan(resultNormal.debug!.marketDemand)
    })
  })
})
