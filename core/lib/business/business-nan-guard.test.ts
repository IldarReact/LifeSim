import { describe, it, expect } from 'vitest'

import type { Business, Employee } from '../../types/business.types'
import type { CountryEconomy } from '../../types/economy.types'
import { getInflatedPrice, getInflatedSalary } from '../calculations/price-helpers'

import { calculateBusinessFinancials } from './business-financials'

describe('Business Financials NaN Guards', () => {
  // Base mock business generator
  const createMockBusiness = (overrides: Partial<Business> = {}): Business => ({
    id: 'test-biz',
    name: 'Test Business',
    type: 'retail',
    description: 'Test',
    state: 'active',
    price: 5,
    quantity: 100,
    isServiceBased: false,
    networkId: undefined,
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
    currentValue: 10000,
    employees: [],
    maxEmployees: 5,
    minEmployees: 1,
    reputation: 50,
    efficiency: 50,
    taxRate: 20,
    hasInsurance: false,
    insuranceCost: 0,
    creationCost: { energy: 0, money: 0 },
    playerRoles: { managerialRoles: [], operationalRole: null },
    employeeRoles: [],
    inventory: {
      currentStock: 1000,
      maxStock: 1000,
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
    ...overrides,
  })

  describe('Service Business Resilience', () => {
    it('should handle NaN price', () => {
      const business = createMockBusiness({
        isServiceBased: true,
        price: NaN,
        inventory: {
          currentStock: 0,
          maxStock: 0,
          pricePerUnit: 0,
          purchaseCost: 0,
          autoPurchaseAmount: 0,
        },
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN()
      expect(result.income).toBeGreaterThanOrEqual(0)
    })

    it('should handle undefined price', () => {
      const business = createMockBusiness({
        isServiceBased: true,
        price: undefined as any,
        inventory: {
          currentStock: 0,
          maxStock: 0,
          pricePerUnit: 0,
          purchaseCost: 0,
          autoPurchaseAmount: 0,
        },
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN()
    })

    it('should handle NaN efficiency and reputation', () => {
      const business = createMockBusiness({
        isServiceBased: true,
        efficiency: NaN,
        reputation: NaN,
        inventory: {
          currentStock: 0,
          maxStock: 0,
          pricePerUnit: 0,
          purchaseCost: 0,
          autoPurchaseAmount: 0,
        },
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN()
      expect(result.income).toBe(0) // 0 efficiency usually means 0 demand
    })

    it('should handle NaN global market value', () => {
      const business = createMockBusiness({
        isServiceBased: true,
        inventory: {
          currentStock: 0,
          maxStock: 0,
          pricePerUnit: 0,
          purchaseCost: 0,
          autoPurchaseAmount: 0,
        },
      })
      const result = calculateBusinessFinancials(business, false, undefined, NaN)

      expect(result.income).not.toBeNaN()
    })
  })

  describe('Product Business Resilience', () => {
    it('should handle NaN inventory prices', () => {
      const business = createMockBusiness({
        isServiceBased: false,
        inventory: {
          currentStock: 100,
          maxStock: 1000,
          pricePerUnit: NaN,
          purchaseCost: NaN,
          autoPurchaseAmount: 0,
        },
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN()
      expect(result.expenses).not.toBeNaN()
      expect(result.profit).not.toBeNaN()
      // Should default to safe values (price 100, cost 50)
      expect(result.debug?.priceUsed).toBe(100)
    })

    it('should handle NaN current stock', () => {
      const business = createMockBusiness({
        isServiceBased: false,
        inventory: {
          currentStock: NaN,
          maxStock: 1000,
          pricePerUnit: 50,
          purchaseCost: 20,
          autoPurchaseAmount: 0,
        },
      })
      const result = calculateBusinessFinancials(business, false)
    })

    it('should handle NaN current stock', () => {
      const business = createMockBusiness({
        isServiceBased: false,
        inventory: {
          currentStock: NaN,
          maxStock: 1000,
          pricePerUnit: 50,
          purchaseCost: 20,
          autoPurchaseAmount: 0,
        },
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN()
      expect(result.newInventory.currentStock).not.toBeNaN()
    })

    it('should handle zero price (infinite margin percentage protection)', () => {
      const business = createMockBusiness({
        isServiceBased: false,
        inventory: {
          currentStock: 100,
          maxStock: 1000,
          pricePerUnit: 0,
          purchaseCost: 20,
          autoPurchaseAmount: 0,
        },
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN() // Sales income 0
      expect(result.income).toBe(0)
    })
  })

  describe('Employee and Tax Resilience', () => {
    it('should handle employees with NaN salary', () => {
      const emp: Employee = {
        id: 'e1',
        name: 'Test',
        role: 'worker',
        stars: 3,
        skills: { efficiency: 50 },
        salary: NaN,
        productivity: 100,
        experience: 1,
        humanTraits: [],
      }
      const business = createMockBusiness({
        employees: [emp],
      })
      const result = calculateBusinessFinancials(business, true)

      expect(result.expenses).not.toBeNaN()
    })

    it('should handle NaN tax rate', () => {
      const business = createMockBusiness({
        taxRate: NaN,
      })
      const result = calculateBusinessFinancials(business, true)

      expect(result.netProfit).not.toBeNaN()
    })
  })

  describe('Inflation and Price Helpers Resilience', () => {
    const mockEconomy: CountryEconomy = {
      id: 'us',
      name: 'USA',
      archetype: 'rich_stable',
      inflation: 2.5,
      inflationHistory: [2.5, 3.0, 2.8],
      salaryModifier: 1.0,
      corporateTaxRate: 0.2,
      taxRate: 0.2,
      interestRate: 0.05,
      keyRate: 0.05,
      gdpGrowth: 0.02,
      stockMarketInflation: 0.03,
      unemployment: 0.05,
      costOfLivingModifier: 1.0,
      activeEvents: [],
    }

    it('should handle NaN in inflation history', () => {
      const economyWithNaN = {
        ...mockEconomy,
        inflationHistory: [2.5, NaN, 3.0],
      }
      const price = getInflatedPrice(100, economyWithNaN, 'default')
      expect(price).not.toBeNaN()
      expect(price).toBeGreaterThan(0)
    })

    it('should handle NaN base salary in getInflatedSalary', () => {
      const salary = getInflatedSalary(NaN, mockEconomy, 4)
      expect(salary).not.toBeNaN()
    })

    it('should handle NaN base price in getInflatedPrice', () => {
      const price = getInflatedPrice(NaN, mockEconomy, 'default')
      expect(price).not.toBeNaN()
    })
  })
})
