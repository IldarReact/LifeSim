import { describe, it, expect } from 'vitest'

import { getQuarterlyInflatedSalary } from '@/core/lib/calculations/price-helpers'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Employee Salary Indexation Tests', () => {
  const mockEconomy: CountryEconomy = {
    id: 'test',
    name: 'Test Country',
    archetype: 'rich_stable',
    gdpGrowth: 2.0,
    inflation: 2.5,
    stockMarketInflation: 0,
    keyRate: 2.0,
    interestRate: 2.0,
    unemployment: 5.0,
    taxRate: 20,
    corporateTaxRate: 20,
    salaryModifier: 1.0,
    costOfLivingModifier: 1.0,
    baseSalaries: {
      manager: 4500,
      salesperson: 3000,
      accountant: 4000,
      marketer: 3500,
      technician: 3000,
      worker: 2200
    },
    activeEvents: [],
    inflationHistory: [2.5, 2.3]
  }

  describe('getQuarterlyInflatedSalary', () => {
    it('должна вернуть базовую зарплату без опыта', () => {
      const baseSalary = 3000
      const result = getQuarterlyInflatedSalary(baseSalary, mockEconomy, 0)
      
      expect(result).toBe(baseSalary)
    })

    it('должна применить индексацию после 4 кварталов (1 год)', () => {
      const baseSalary = 3000
      const result = getQuarterlyInflatedSalary(baseSalary, mockEconomy, 4)
      
      expect(result).toBeGreaterThan(baseSalary)
    })

    it('не должна индексировать в течение первого года', () => {
      const baseSalary = 3000
      const result1 = getQuarterlyInflatedSalary(baseSalary, mockEconomy, 1)
      const result2 = getQuarterlyInflatedSalary(baseSalary, mockEconomy, 2)
      const result3 = getQuarterlyInflatedSalary(baseSalary, mockEconomy, 3)
      
      expect(result1).toBe(baseSalary)
      expect(result2).toBe(baseSalary)
      expect(result3).toBe(baseSalary)
    })
  })
})
