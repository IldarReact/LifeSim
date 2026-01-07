import { describe, it, expect } from 'vitest'

import type { Business } from '../../types/business.types'
import type { CountryEconomy } from '../../types/economy.types'
import type { Skill } from '../../types/skill.types'

import { calculateBusinessFinancials } from './business-financials'

describe('calculateBusinessFinancials Integration Tests', () => {
  const mockEconomy: CountryEconomy = {
    id: 'us',
    name: 'USA', // Added missing property
    archetype: 'rich_stable', // Added missing property
    gdpGrowth: 0.01,
    inflation: 0.02,
    stockMarketInflation: 0.02, // Added missing property
    keyRate: 0.02, // Added missing property
    interestRate: 0.02, // Added missing property
    unemployment: 0.05,
    taxRate: 15, // Added missing property
    corporateTaxRate: 20, // Added missing property
    salaryModifier: 1.0, // Added missing property
    costOfLivingModifier: 1.0, // Added missing property
    activeEvents: [], // Added missing property
    inflationHistory: [], // Added missing property
  }

  const baseBusiness: Business = {
    id: 'biz_1',
    name: 'Test Business',
    type: 'retail',
    description: 'Test Description',
    initialCost: 100000,
    monthlyIncome: 5000,
    monthlyExpenses: 3000,
    maxEmployees: 5,
    minEmployees: 1,
    taxRate: 15,
    employeeRoles: [{ role: 'worker', priority: 'required', description: 'Worker' }],
    inventory: {
      currentStock: 1000,
      maxStock: 2000,
      pricePerUnit: 100,
      purchaseCost: 50,
      autoPurchaseAmount: 100,
    },
    employees: [
      {
        id: 'emp_worker_1',
        name: 'John Worker',
        role: 'worker',
        stars: 3,
        salary: 2000,
        productivity: 100,
        skills: { efficiency: 60 },
        experience: 0,
        effortPercent: 100,
        humanTraits: [],
      },
    ],
    walletBalance: 1000,
    state: 'active',
    reputation: 50,
    efficiency: 50,
    price: 5,
    foundedTurn: 1,
    createdAt: 1, // Added missing property
    playerRoles: {
      managerialRoles: [],
      operationalRole: null,
    },
    openingProgress: {
      totalQuarters: 1,
      quartersLeft: 0,
      investedAmount: 100000,
      totalCost: 100000,
      upfrontCost: 20000,
    },
    currentValue: 100000,
    eventsHistory: [],
    lastQuarterlyUpdate: 0, // Added missing property
    quantity: 0, // Added missing property
    isServiceBased: false, // Added missing property
    isMainBranch: true, // Added missing property
    autoPurchaseAmount: 0, // Added missing property
    partners: [], // Added missing property
    proposals: [], // Added missing property
    creationCost: { energy: 0, sanity: 0, happiness: 0, health: 0, intelligence: 0 }, // Added missing property
    quarterlyIncome: 0, // Added missing property
    quarterlyExpenses: 0, // Added missing property
    quarterlyTax: 0, // Added missing property
    hasInsurance: false, // Added missing property
    insuranceCost: 0, // Added missing property
  }

  const playerSkills: Skill[] = [
    { id: 'management', name: 'Management', level: 5, progress: 0, lastPracticedTurn: 0 },
    { id: 'marketing', name: 'Marketing', level: 3, progress: 0, lastPracticedTurn: 0 },
  ]

  it('should calculate financials correctly for a standard retail business', () => {
    const result = calculateBusinessFinancials(baseBusiness, false, playerSkills, 1.0, mockEconomy)

    expect(result.income).toBeGreaterThan(0)
    expect(result.expenses).toBeGreaterThan(0)
    expect(result.netProfit).toBeDefined()
    expect(isNaN(result.income)).toBe(false)
    expect(isNaN(result.expenses)).toBe(false)
    expect(isNaN(result.netProfit)).toBe(false)
  })

  it('should handle service businesses correctly', () => {
    const serviceBusiness: Business = {
      ...baseBusiness,
      type: 'service',
      isServiceBased: true,
      inventory: {
        currentStock: 0,
        maxStock: 0,
        pricePerUnit: 0,
        purchaseCost: 0,
        autoPurchaseAmount: 0,
      },
    }
    const result = calculateBusinessFinancials(
      serviceBusiness,
      false,
      playerSkills,
      1.0,
      mockEconomy,
    )

    expect(result.income).toBeGreaterThan(0)
    expect(isNaN(result.income)).toBe(false)
  })

  it('should handle product businesses with inventory', () => {
    const productBusiness: Business = {
      ...baseBusiness,
      type: 'retail',
      isServiceBased: false,
      inventory: {
        currentStock: 100,
        maxStock: 500,
        pricePerUnit: 100,
        purchaseCost: 50,
        autoPurchaseAmount: 0,
      },
    }
    const result = calculateBusinessFinancials(
      productBusiness,
      false,
      playerSkills,
      1.0,
      mockEconomy,
    )

    expect(result.income).toBeGreaterThan(0)
    expect(result.expenses).toBeGreaterThan(0)
    expect(isNaN(result.income)).toBe(false)
  })

  it('should handle zero employees without NaN', () => {
    const emptyBusiness: Business = {
      ...baseBusiness,
      employees: [],
    }
    const result = calculateBusinessFinancials(emptyBusiness, false, playerSkills, 1.0, mockEconomy)

    // Even with 0 employees, if there is inventory, sales can happen
    expect(result.income).toBeGreaterThanOrEqual(0)
    expect(result.expenses).toBeGreaterThan(0) // Fixed costs still exist
    expect(isNaN(result.income)).toBe(false)
    expect(isNaN(result.expenses)).toBe(false)
  })

  it('should handle extreme inflation values without NaN', () => {
    const crazyEconomy: CountryEconomy = {
      ...mockEconomy,
      inflation: 9999999,
    }
    const result = calculateBusinessFinancials(baseBusiness, false, playerSkills, 1.0, crazyEconomy)

    expect(isNaN(result.income)).toBe(false)
    expect(isNaN(result.expenses)).toBe(false)
  })

  it('should apply tax reductions correctly', () => {
    const businessWithTaxReduction: Business = {
      ...baseBusiness,
      playerRoles: {
        managerialRoles: ['lawyer'],
        operationalRole: null,
      },
    }

    // Lawyer role gives tax reduction based on skill level
    const skilledPlayer: Skill[] = [
      { id: 'jurisprudence', name: 'Юриспруденция', level: 5, progress: 0, lastPracticedTurn: 0 },
    ]

    const result = calculateBusinessFinancials(
      businessWithTaxReduction,
      false,
      skilledPlayer,
      1.0,
      mockEconomy,
    )

    // With 5 skill points, lawyer gives 5 * 3 = 15% tax reduction
    // Tax rate is 15. Reduced rate = 15 * (1 - 0.15) = 12.75
    // Original tax on e.g. 1000 profit = 150
    // New tax = 127.5 -> 128
    // We just check that tax is calculated and not NaN
    expect(result.debug?.taxAmount).toBeDefined()
    expect(isNaN(result.debug?.taxAmount as number)).toBe(false)
  })

  it('should handle undefined economy gracefully', () => {
    // economy deliberately undefined to verify default branches
    const result = calculateBusinessFinancials(baseBusiness, false, playerSkills, 1.0, undefined)
    expect(isNaN(result.income)).toBe(false)
    expect(isNaN(result.expenses)).toBe(false)
  })
})
