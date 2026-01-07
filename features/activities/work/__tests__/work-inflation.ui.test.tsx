/**
 * UI Integration Tests for Work Activity Inflation
 * Тестируем реальные компоненты work с инфляцией
 */

import { describe, it, expect } from 'vitest'

import { getInflatedSalary, getInflatedBaseSalary } from '@/core/lib/calculations/price-helpers'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Work Activity - Inflation UI Tests', () => {
  const baseEconomy: CountryEconomy = {
    id: 'us',
    name: 'USA',
    archetype: 'rich_stable',
    gdpGrowth: 2.0,
    inflation: 3.1,
    stockMarketInflation: 7.5,
    keyRate: 5.33,
    interestRate: 2.0,
    unemployment: 4.1,
    taxRate: 24,
    corporateTaxRate: 21,
    salaryModifier: 1.8,
    costOfLivingModifier: 1.6,
    baseSalaries: {
      manager: 4500,
      salesperson: 3000,
      accountant: 4000,
      marketer: 3500,
      technician: 3000,
      worker: 2200,
    },
    activeEvents: [],
    inflationHistory: [3.1, 3.0, 3.2],
  }

  describe('VacanciesSection', () => {
    it('должен применить инфляцию ко всем вакансиям', () => {
      const salaries = [3000, 8000]
      const results = salaries.map((s) => getInflatedBaseSalary(s, baseEconomy))

      expect(results[0]).toBeGreaterThan(3000)
      expect(results[1]).toBeGreaterThan(8000)

      const display = `$${results[0].toLocaleString()}/мес`
      expect(display).toMatch(/\$[\d\s,]+\/мес/)
    })
  })

  describe('Extreme Scenarios', () => {
    it('должен обработать гиперинфляцию', () => {
      const hyperEconomy: CountryEconomy = {
        ...baseEconomy,
        inflation: 20,
        inflationHistory: [20, 19, 21, 18, 20],
      }

      const result = getInflatedSalary(5000, hyperEconomy, 12)

      expect(result).toBeGreaterThan(7000)
    })
  })
})
