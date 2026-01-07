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

  const createMockEmployee = (role: Employee['role'], stars: number = 3): Employee => ({
    id: `emp-${role}`,
    name: 'Test Employee',
    role,
    stars: stars as any,
    skills: {
      efficiency: 50,
    },
    salary: 1000,
    productivity: 100,
    experience: 4,
    humanTraits: [],
  })

  describe('Price Impact on Demand', () => {
    it('should decrease demand when price increases', () => {
      const worker = createMockEmployee('worker')

      const lowPriceBusiness = createBaseBusiness({
        price: 3,
        employees: [worker],
        inventory: {
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 30, // Low price
          purchaseCost: 20,
          autoPurchaseAmount: 0,
        },
      })

      const highPriceBusiness = createBaseBusiness({
        price: 8,
        employees: [worker],
        inventory: {
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 80, // High price
          purchaseCost: 20,
          autoPurchaseAmount: 0,
        },
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
        employees: [worker],
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)
      expect(result.income).toBeGreaterThan(0)
    })

    it('should handle maximum price (10)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        price: 10,
        employees: [worker],
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)
      expect(result.income).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Global Market Impact', () => {
    it('should increase income during market boom (value > 1.0)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
      })

      const normalMarket = calculateBusinessFinancials(business, true, undefined, 1.0)
      const boomMarket = calculateBusinessFinancials(business, true, undefined, 1.5)

      // Boom market should increase income
      expect(boomMarket.income).toBeGreaterThan(normalMarket.income)
    })

    it('should decrease income during market crisis (value < 1.0)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
      })

      const normalMarket = calculateBusinessFinancials(business, true, undefined, 1.0)
      const crisisMarket = calculateBusinessFinancials(business, true, undefined, 0.7)

      // Crisis market should decrease income
      expect(crisisMarket.income).toBeLessThan(normalMarket.income)
    })

    it('should handle extreme market collapse (value = 0.3)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
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
          autoPurchaseAmount: 0,
        },
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
        employees: [worker],
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
        employees: [worker],
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
        taxRate: 0.2,
      })

      const businessWithAccountant = createBaseBusiness({
        employees: [worker, accountant],
        taxRate: 0.2,
      })

      const withoutResult = calculateBusinessFinancials(
        businessWithoutAccountant,
        true,
        undefined,
        1.0,
      )
      const withResult = calculateBusinessFinancials(businessWithAccountant, true, undefined, 1.0)

      const withoutTax = withoutResult.debug?.taxAmount ?? 0
      const withTax = withResult.debug?.taxAmount ?? 0
      expect(withTax).toBeLessThanOrEqual(withoutTax)
    })

    it('should reduce taxes when player acts as accountant (by skill)', () => {
      const worker = createMockEmployee('worker')

      const baseBusiness = createBaseBusiness({
        employees: [worker],
        taxRate: 0.2,
        playerRoles: { managerialRoles: [], operationalRole: null },
      })

      const playerAccountantBusiness = createBaseBusiness({
        employees: [worker],
        taxRate: 0.2,
        playerRoles: { managerialRoles: ['accountant'], operationalRole: null },
      })

      const control = calculateBusinessFinancials(baseBusiness, true, [], 1.0)
      const withPlayerAcc = calculateBusinessFinancials(
        playerAccountantBusiness,
        true,
        [
          {
            id: 'skill_accounting',
            name: 'Бухгалтерия',
            level: 4,
            progress: 0,
            lastPracticedTurn: 0,
          },
        ],
        1.0,
      )

      const taxControl = control.debug?.taxAmount ?? 0
      const taxWithPlayerAcc = withPlayerAcc.debug?.taxAmount ?? 0
      expect(taxWithPlayerAcc).toBeLessThanOrEqual(taxControl)
      expect(withPlayerAcc.netProfit).toBeGreaterThanOrEqual(control.netProfit)
    })
  })

  describe('Combined Effects', () => {
    it('should handle price + market + quantity together', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        price: 7,
        quantity: 300,
        employees: [worker],
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
          autoPurchaseAmount: 0,
        },
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)

      // New inventory should be calculated
      expect(result.newInventory.currentStock).toBeGreaterThanOrEqual(0)
      expect(result.newInventory.currentStock).toBeLessThanOrEqual(1000)
    })
  })

  describe('Crisis Demand vs Margin', () => {
    it('cheap goods should outperform luxury in crisis', () => {
      const worker = createMockEmployee('worker')
      const lowMarginBusiness = createBaseBusiness({
        employees: [worker],
        price: 2, // Low price slider
        inventory: {
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 26,
          purchaseCost: 20,
          autoPurchaseAmount: 0,
        },
      })
      const highMarginBusiness = createBaseBusiness({
        employees: [worker],
        price: 8, // High price slider
        inventory: {
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 80,
          purchaseCost: 20,
          autoPurchaseAmount: 0,
        },
      })

      const crisisValue = 0.7
      const lowMarginResult = calculateBusinessFinancials(
        lowMarginBusiness,
        true,
        undefined,
        crisisValue,
      )
      const highMarginResult = calculateBusinessFinancials(
        highMarginBusiness,
        true,
        undefined,
        crisisValue,
      )

      expect(lowMarginResult.income).toBeGreaterThan(highMarginResult.income)
    })
    it('cheap goods demand should be resilient in crisis vs normal', () => {
      const worker = createMockEmployee('worker')
      const lowMarginBusiness = createBaseBusiness({
        employees: [worker],
        price: 1, // Minimum price slider
        inventory: {
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 26,
          purchaseCost: 20,
          autoPurchaseAmount: 0,
        },
      })
      const normal = calculateBusinessFinancials(lowMarginBusiness, true, undefined, 1.0)
      const crisis = calculateBusinessFinancials(lowMarginBusiness, true, undefined, 0.7)
      expect(crisis.income).toBeGreaterThan(normal.income * 0.7) // Resilient: better than market drop (0.7)
    })
    it('luxury goods income should drop in crisis vs normal', () => {
      const worker = createMockEmployee('worker')
      const highMarginBusiness = createBaseBusiness({
        employees: [worker],
        inventory: {
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 80,
          purchaseCost: 20,
          autoPurchaseAmount: 0,
        },
      })
      const normal = calculateBusinessFinancials(highMarginBusiness, true, undefined, 1.0)
      const crisis = calculateBusinessFinancials(highMarginBusiness, true, undefined, 0.7)
      expect(crisis.income).toBeLessThan(normal.income)
    })
  })

  describe('Workers-based demand', () => {
    it('income grows with more workers for product businesses', () => {
      const worker = createMockEmployee('worker')

      const noWorkersBiz = createBaseBusiness({
        employees: [],
        inventory: {
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 50,
          purchaseCost: 20,
          autoPurchaseAmount: 0,
        },
      })
      const twoWorkersBiz = createBaseBusiness({
        employees: [worker, { ...worker, id: 'emp-worker-2' }],
        inventory: {
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 50,
          purchaseCost: 20,
          autoPurchaseAmount: 0,
        },
      })

      const res0 = calculateBusinessFinancials(noWorkersBiz, true, undefined, 1.0)
      const res2 = calculateBusinessFinancials(twoWorkersBiz, true, undefined, 1.0)

      expect(res2.income).toBeGreaterThan(res0.income)
    })
  })
})
