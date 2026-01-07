import { describe, it, expect } from 'vitest'

import { calculateBusinessFinancials } from '../business-financials'

import type { Business } from '@/core/types'

describe('Business Profitability (Financial Balance)', () => {
  const baseBusiness: Business = {
    id: 'test-biz',
    name: 'Test Shop',
    type: 'retail',
    description: 'Test',
    state: 'active',
    price: 6, // 3x multiplier
    quantity: 1000,
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
    reputation: 80,
    efficiency: 100,
    taxRate: 15,
    hasInsurance: false,
    insuranceCost: 0,
    creationCost: { energy: 0, money: 0 },
    playerRoles: { managerialRoles: [], operationalRole: 'worker' },
    employeeRoles: [],
    inventory: {
      currentStock: 1000,
      maxStock: 5000,
      pricePerUnit: 100,
      purchaseCost: 50,
      autoPurchaseAmount: 1000,
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

  it('should be profitable with 1 worker and good efficiency', () => {
    const biz: Business = {
      ...baseBusiness,
      employees: [
        {
          id: 'emp1',
          name: 'Worker 1',
          role: 'worker',
          stars: 3,
          salary: 1500, // Quarterly salary
          skills: { efficiency: 70 },
          productivity: 80,
          experience: 5,
          humanTraits: [],
          effortPercent: 100,
        },
      ],
    }

    const result = calculateBusinessFinancials(biz, true)

    // С новой выработкой (300) один рабочий при 80% эффективности должен давать 240 единиц
    // При марже (300 - 50 = 250) доход должен покрывать расходы
    expect(result.netProfit).toBeGreaterThan(0)
    console.log(`Profit with 1 worker: $${result.netProfit}`)
  })

  it('should have negative profit if price is too low (below cost)', () => {
    const biz: Business = {
      ...baseBusiness,
      price: 1, // 0.5x multiplier -> price 25 when cost is 50
      employees: [
        {
          id: 'emp1',
          name: 'Worker 1',
          role: 'worker',
          stars: 3,
          salary: 1500,
          skills: { efficiency: 70 },
          productivity: 80,
          experience: 5,
          humanTraits: [],
          effortPercent: 100,
        },
      ],
    }

    const result = calculateBusinessFinancials(biz, true)
    expect(result.netProfit).toBeLessThan(0)
  })
})
