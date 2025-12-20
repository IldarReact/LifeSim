import { describe, it, expect } from 'vitest'

import { generateEmployeeCandidate, calculateSalary } from '@/core/lib/business/employee-generator'
import { getInflatedBaseSalary } from '@/core/lib/calculations/price-helpers'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Salary Inflation Tests', () => {
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

  describe('getInflatedBaseSalary', () => {
    it('должна вернуть базовую зарплату без инфляции', () => {
      const baseSalary = 4500
      const result = getInflatedBaseSalary(baseSalary, mockEconomyNoInflation)
      
      expect(result).toBe(baseSalary)
    })

    it('должна применить инфляцию к базовой зарплате', () => {
      const baseSalary = 4500
      const result = getInflatedBaseSalary(baseSalary, mockEconomyWithInflation)
      
      expect(result).toBeGreaterThan(baseSalary)
      expect(result).toBeCloseTo(4706, -1)
    })
  })

  describe('calculateSalary', () => {
    it('должна применить инфляцию к зарплате', () => {
      const withoutInflation = calculateSalary('manager', 1, mockEconomyNoInflation)
      const withInflation = calculateSalary('manager', 1, mockEconomyWithInflation)
      
      expect(withInflation).toBeGreaterThan(withoutInflation)
    })
  })

  describe('generateEmployeeCandidate', () => {
    it('должна генерировать кандидата с инфлированной зарплатой', () => {
      const candidateNoInflation = generateEmployeeCandidate('manager', 1, mockEconomyNoInflation)
      const candidateWithInflation = generateEmployeeCandidate('manager', 1, mockEconomyWithInflation)
      
      expect(candidateWithInflation.requestedSalary).toBeGreaterThan(candidateNoInflation.requestedSalary)
    })
  })

  describe('UI Integration', () => {
    it('зарплата в UI должна отражать инфляцию', () => {
      const candidate = generateEmployeeCandidate('manager', 3, mockEconomyWithInflation)
      const displaySalary = `$${candidate.requestedSalary.toLocaleString()}/мес`
      
      expect(displaySalary).toMatch(/\$[\d,]+\/мес/)
      expect(candidate.requestedSalary).toBeGreaterThan(4500)
    })
  })
})
