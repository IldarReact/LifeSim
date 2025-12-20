import { describe, it, expect } from 'vitest'

import { getInflatedBaseSalary } from '@/core/lib/calculations/price-helpers'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Job Salary Inflation Tests', () => {
  const mockEconomyNoInflation: CountryEconomy = {
    id: 'test',
    name: 'Test Country',
    archetype: 'rich_stable',
    gdpGrowth: 2.0,
    inflation: 0,
    stockMarketInflation: 0,
    keyRate: 2.0,
    interestRate: 2.0,
    unemployment: 5.0,
    taxRate: 20,
    corporateTaxRate: 0.2,
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
    inflationHistory: []
  }

  const mockEconomyWithInflation: CountryEconomy = {
    ...mockEconomyNoInflation,
    inflation: 2.5,
    inflationHistory: [2.5, 2.3]
  }

  describe('getInflatedBaseSalary для вакансий', () => {
    it('должна вернуть базовую зарплату без инфляции', () => {
      const baseSalary = 25000 // IT-специалист
      const result = getInflatedBaseSalary(baseSalary, mockEconomyNoInflation)
      
      expect(result).toBe(baseSalary)
    })

    it('должна применить инфляцию к зарплате вакансии', () => {
      const baseSalary = 25000
      const result = getInflatedBaseSalary(baseSalary, mockEconomyWithInflation)
      
      expect(result).toBeGreaterThan(baseSalary)
      // Категория 'salaries' имеет multiplier 0.95
      // Year 1: 25000 * (1 + 2.3% * 0.95) = 25547
      // Year 2: 25547 * (1 + 2.5% * 0.95) = 26156
      expect(result).toBeCloseTo(26156, -2)
    })

    it('должна корректно обрабатывать разные уровни зарплат', () => {
      const juniorSalary = 19500
      const seniorSalary = 48000
      
      const juniorInflated = getInflatedBaseSalary(juniorSalary, mockEconomyWithInflation)
      const seniorInflated = getInflatedBaseSalary(seniorSalary, mockEconomyWithInflation)
      
      expect(juniorInflated).toBeGreaterThan(juniorSalary)
      expect(seniorInflated).toBeGreaterThan(seniorSalary)
      
      // Пропорция должна сохраняться
      const originalRatio = seniorSalary / juniorSalary
      const inflatedRatio = seniorInflated / juniorInflated
      expect(inflatedRatio).toBeCloseTo(originalRatio, 1)
    })
  })

  describe('Реалистичность зарплат с инфляцией', () => {
    it('Junior Developer зарплата должна расти реалистично', () => {
      const baseSalary = 19500
      const inflated = getInflatedBaseSalary(baseSalary, mockEconomyWithInflation)
      
      // Рост должен быть в пределах 4-6% за 2 года
      const growthPercent = ((inflated - baseSalary) / baseSalary) * 100
      expect(growthPercent).toBeGreaterThan(4)
      expect(growthPercent).toBeLessThan(6)
    })

    it('Senior Developer зарплата должна расти пропорционально', () => {
      const baseSalary = 48000
      const inflated = getInflatedBaseSalary(baseSalary, mockEconomyWithInflation)
      
      const growthPercent = ((inflated - baseSalary) / baseSalary) * 100
      expect(growthPercent).toBeGreaterThan(4)
      expect(growthPercent).toBeLessThan(6)
    })
  })
})
