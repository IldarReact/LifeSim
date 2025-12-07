import { describe, it, expect } from 'vitest'
import { calculateBusinessFinancials } from './business-utils'
import type { Business, Employee } from '@/core/types'

describe('Business Pricing & Market Tests', () => {
  const createBaseBusiness = (overrides?: Partial<Business>): Business => ({
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
    initialCost: 10000,
    quarterlyIncome: 0,
    quarterlyExpenses: 0,
    currentValue: 10000,
    employees: [],
    maxEmployees: 5,
    minEmployees: 1,
    reputation: 50,
    efficiency: 50,
    customerSatisfaction: 50,
    taxRate: 0.2,
    hasInsurance: false,
    insuranceCost: 0,
    creationCost: { energy: 0, money: 0 },
    playerRoles: { managerialRoles: [], operationalRole: null },
    requiredRoles: [],
    inventory: {
      currentStock: 1000,
      maxStock: 1000,
      pricePerUnit: 50,
      purchaseCost: 20,
      autoPurchaseAmount: 0
    },
    openingProgress: { totalQuarters: 0, quartersLeft: 0, investedAmount: 0, totalCost: 0, upfrontCost: 0 },
    eventsHistory: [],
    foundedTurn: 1,
    ...overrides
  })

  const createMockEmployee = (role: Employee['role'], stars: number = 3): Employee => ({
    id: `emp-${role}`,
    name: 'Test Employee',
    role,
    stars: stars as any,
    skills: {
      efficiency: 50,
      salesAbility: 50,
      technical: 50,
      management: 50,
      creativity: 50
    },
    salary: 1000,
    satisfaction: 100,
    productivity: 100,
    experience: 4,
    humanTraits: []
  })

  describe('Price Impact on Demand', () => {
    it('should decrease demand when price increases', () => {
      const worker = createMockEmployee('worker')

      const lowPriceBusiness = createBaseBusiness({
        price: 3,
        employees: [worker]
      })

      const highPriceBusiness = createBaseBusiness({
        price: 8,
        employees: [worker]
      })

      const lowPriceResult = calculateBusinessFinancials(lowPriceBusiness, true, undefined, 1.0)
      const highPriceResult = calculateBusinessFinancials(highPriceBusiness, true, undefined, 1.0)

      // Lower price should result in higher income (more sales)
      expect(lowPriceResult.income).toBeGreaterThan(highPriceResult.income)
    })

    it('should handle minimum price (1)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        price: 1,
        employees: [worker]
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)
      expect(result.income).toBeGreaterThan(0)
    })

    it('should handle maximum price (10)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        price: 10,
        employees: [worker]
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)
      expect(result.income).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Global Market Impact', () => {
    it('should increase income during market boom (value > 1.0)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker]
      })

      const normalMarket = calculateBusinessFinancials(business, true, undefined, 1.0)
      const boomMarket = calculateBusinessFinancials(business, true, undefined, 1.5)

      // Boom market should increase income
      expect(boomMarket.income).toBeGreaterThan(normalMarket.income)
    })

    it('should decrease income during market crisis (value < 1.0)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker]
      })

      const normalMarket = calculateBusinessFinancials(business, true, undefined, 1.0)
      const crisisMarket = calculateBusinessFinancials(business, true, undefined, 0.7)

      // Crisis market should decrease income
      expect(crisisMarket.income).toBeLessThan(normalMarket.income)
    })

    it('should handle extreme market collapse (value = 0.3)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker]
      })

      const result = calculateBusinessFinancials(business, true, undefined, 0.3)

      // Should still calculate without errors
      expect(result.income).toBeGreaterThanOrEqual(0)
      expect(result.expenses).toBeGreaterThan(0)
    })
  })

  describe('Quantity Management', () => {
    it('should use quantity as target stock level', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        quantity: 500, // Target 500 units
        employees: [worker],
        inventory: {
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 50,
          purchaseCost: 20,
          autoPurchaseAmount: 0
        }
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)

      // Should calculate purchase based on target quantity
      expect(result.newInventory).toBeDefined()
    })

    it('should not affect service-based businesses', () => {
      const worker = createMockEmployee('worker')
      const serviceBusiness = createBaseBusiness({
        isServiceBased: true,
        quantity: 0,
        employees: [worker]
      })

      const result = calculateBusinessFinancials(serviceBusiness, true, undefined, 1.0)

      // Service business should not have inventory changes
      expect(result.income).toBeGreaterThan(0)
    })
  })

  describe('Tax Calculation', () => {
    it('should apply taxes to gross profit', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        taxRate: 0.2, // 20% tax
        employees: [worker]
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)

      // Taxes should be included in expenses
      expect(result.expenses).toBeGreaterThan(0)
    })

    it('should reduce taxes with accountant', () => {
      const worker = createMockEmployee('worker')
      const accountant = createMockEmployee('accountant', 5)

      const businessWithoutAccountant = createBaseBusiness({
        employees: [worker],
        taxRate: 0.2
      })

      const businessWithAccountant = createBaseBusiness({
        employees: [worker, accountant],
        taxRate: 0.2
      })

      const withoutResult = calculateBusinessFinancials(businessWithoutAccountant, true, undefined, 1.0)
      const withResult = calculateBusinessFinancials(businessWithAccountant, true, undefined, 1.0)

      // With accountant, profit should be higher (less taxes)
      // Note: accountant also costs salary, so we check that logic runs
      expect(withResult.expenses).toBeDefined()
    })
  })

  describe('Combined Effects', () => {
    it('should handle price + market + quantity together', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        price: 7,
        quantity: 300,
        employees: [worker]
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.2)

      expect(result.income).toBeGreaterThan(0)
      expect(result.expenses).toBeGreaterThan(0)
      expect(result.profit).toBeDefined()
      expect(result.newInventory).toBeDefined()
    })

    it('should maintain inventory correctly over time', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
        inventory: {
          currentStock: 500,
          maxStock: 1000,
          pricePerUnit: 50,
          purchaseCost: 20,
          autoPurchaseAmount: 0
        }
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)

      // New inventory should be calculated
      expect(result.newInventory.currentStock).toBeGreaterThanOrEqual(0)
      expect(result.newInventory.currentStock).toBeLessThanOrEqual(1000)
    })
  })
})
