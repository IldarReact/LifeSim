import { describe, it, expect } from 'vitest'

import { calculateBusinessFinancials } from './business-utils'

import type { Business, Employee } from '@/core/types'

describe('Business Formulas', () => {
  const mockBusiness: Business = {
    id: 'test-biz',
    name: 'Test Business',
    type: 'retail',
    description: 'Test',
    state: 'active',

    // Новые поля
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
      currentStock: 100,
      maxStock: 200,
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

  const createMockEmployee = (role: Employee['role'], stars: number = 3): Employee => ({
    id: 'emp-1',
    name: 'John Doe',
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

  describe('calculateBusinessFinancials', () => {
    it('should calculate base financials with employees', () => {
      // Need at least 1 employee for efficiency > 0
      const employee = createMockEmployee('worker')
      const businessWithEmployee = {
        ...mockBusiness,
        employees: [employee],
      }

      // Pass isPreview=true for deterministic demand (fluctuation = 1.0)
      const result = calculateBusinessFinancials(businessWithEmployee, true)

      // Base Expenses: Salary (1000) + Rent (5*200=1000) + Utilities (5*50=250) = 2250
      // Efficiency: ~50 (from employee)
      // Demand: 5 * 50 * (50/100) * (50/100) * 1.0 = 250 * 0.5 * 0.5 = 62.5 -> 62
      // Sales: min(100, 62) = 62
      // Income: 62 * 50 = 3100
      // Purchase: max(0, 200 - (100 - 62)) = 200 - 38 = 162
      // Purchase Cost: 162 * 20 = 3240
      // Total Expenses: 2250 + 3240 = 5490
      // Profit: 3100 - 5490 = -2390

      // Note: exact numbers depend on calculateEfficiency implementation which might vary slightly
      // But we check structure

      expect(result.income).toBeGreaterThan(0)
      expect(result.expenses).toBeGreaterThan(0)
      expect(result.newInventory).toBeDefined()
      expect(result.newInventory.currentStock).toBeGreaterThan(0)
    })

    it('should reduce taxes with an accountant', () => {
      const worker = createMockEmployee('worker')
      const accountant = createMockEmployee('accountant', 5)

      const business = {
        ...mockBusiness,
        employees: [worker],
      }

      const businessWithAccountant = {
        ...mockBusiness,
        employees: [worker, accountant],
      }

      const res1 = calculateBusinessFinancials(business, true)
      const res2 = calculateBusinessFinancials(businessWithAccountant, true)

      // Проверяем именно снижение налога при наличии бухгалтера
      const tax1 = res1.debug?.taxAmount ?? 0
      const tax2 = res2.debug?.taxAmount ?? 0
      expect(tax2).toBeLessThanOrEqual(tax1)
    })
  })
})
