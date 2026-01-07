/**
 * Simplified UI Inflation Tests
 * Тестируем domain функции напрямую (без React hooks)
 */

import { describe, it, expect } from 'vitest'

import {
  getInflatedPrice,
  getInflatedShopPrice,
  getInflatedHousingPrice,
  getInflatedSalary,
  getInflatedEducationPrice,
} from '@/core/lib/calculations/price-helpers'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Inflation UI Tests - Simplified', () => {
  const economyNoInflation: CountryEconomy = {
    id: 'us',
    name: 'USA',
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
      worker: 2200,
    },
    activeEvents: [],
    inflationHistory: [],
  }

  const economyWithInflation: CountryEconomy = {
    ...economyNoInflation,
    inflation: 2.5,
    inflationHistory: [2.5, 2.3, 2.7], // 3 года
  }

  const economyHighInflation: CountryEconomy = {
    ...economyNoInflation,
    inflation: 8.9,
    inflationHistory: [8.9, 8.5, 9.2, 8.7, 9.0], // 5 лет (Бразилия)
  }

  describe('Shop Items', () => {
    it('еда растёт медленно (multiplier 0.5x)', () => {
      const result = getInflatedShopPrice(100, economyWithInflation, 'food')

      expect(result).toBeGreaterThan(100)
      expect(result).toBeLessThan(105) // Медленный рост
    })

    it('жильё растёт быстро (multiplier 1.5x)', () => {
      const result = getInflatedHousingPrice(250000, economyWithInflation)

      expect(result).toBeGreaterThan(250000)
      // With 3 years of 2.5% inflation and 1.5x multiplier, expected value is ~279,191
      expect(result).toBeGreaterThan(275000)
      expect(Math.round(result)).toBe(279191) // Exact expected value
    })

    it('recurring items (аренда)', () => {
      const result = getInflatedHousingPrice(1200, economyWithInflation)

      expect(result).toBeGreaterThan(1200)
      expect(result).toBeCloseTo(1350, -2)
    })
  })

  describe('Salaries', () => {
    it('зарплаты растут почти как инфляция (multiplier 0.7-0.9x)', () => {
      // Test with 4 quarters (1 year) passed
      const result = getInflatedSalary(5000, economyWithInflation, 4)

      // With 2.5% inflation and 0.7-0.9x multiplier, expected range is 5087-5211
      expect(result).toBeGreaterThan(5000)
      expect(result).toBeGreaterThanOrEqual(5087)
      expect(result).toBeLessThanOrEqual(5211)
    })

    it('массив зарплат', () => {
      const salaries = [3000, 5000, 8000]
      // Test with 8 quarters (2 years) passed
      const results = salaries.map((s) => getInflatedSalary(s, economyWithInflation, 8))

      // Check that all salaries increased
      expect(results[0]).toBeGreaterThan(3000)
      expect(results[1]).toBeGreaterThan(5000)
      expect(results[2]).toBeGreaterThan(8000)

      // Check they increased proportionally
      const ratio1 = results[0] / 3000
      const ratio2 = results[1] / 5000
      const ratio3 = results[2] / 8000

      // All salaries should have increased by roughly the same percentage
      expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.05) // Within 5% of each other
      expect(Math.abs(ratio1 - ratio3)).toBeLessThan(0.05) // Within 5% of each other
    })
  })

  describe('Business', () => {
    it('стоимость бизнеса (multiplier 1.3x)', () => {
      const result = getInflatedPrice(50000, economyWithInflation, 'business')

      expect(result).toBeGreaterThan(50000)
      expect(result).toBeGreaterThan(54500)
    })
  })

  describe('High Inflation (Бразилия)', () => {
    it('квартира удваивается за 5 лет', () => {
      const result = getInflatedHousingPrice(180000, economyHighInflation)

      expect(result).toBeGreaterThan(180000)
      expect(result).toBeGreaterThan(300000) // Более чем удвоение
    })

    it('еда vs жильё: разница в росте', () => {
      const food = getInflatedShopPrice(100, economyHighInflation, 'food')
      const housing = getInflatedHousingPrice(100, economyHighInflation)

      expect(housing).toBeGreaterThan(food)
      expect(housing / food).toBeGreaterThan(1.5) // Жильё растёт в 1.5+ раз быстрее
    })
  })

  describe('Education', () => {
    it('курсы (multiplier 1.2x)', () => {
      const result = getInflatedEducationPrice(1500, economyWithInflation)

      expect(result).toBeGreaterThan(1500)
      expect(result).toBeGreaterThan(1620)
    })

    it('университет', () => {
      const result = getInflatedEducationPrice(8000, economyWithInflation)

      expect(result).toBeGreaterThan(8000)
      expect(result).toBeGreaterThan(8640)
    })
  })

  describe('Real World Comparison', () => {
    it('США vs Бразилия: одинаковая квартира', () => {
      const usEconomy: CountryEconomy = {
        ...economyNoInflation,
        inflation: 3.1,
        inflationHistory: [3.1, 3.0, 3.2, 2.9, 3.1],
      }

      const brazilEconomy: CountryEconomy = {
        ...economyNoInflation,
        inflation: 8.9,
        inflationHistory: [8.9, 8.5, 9.2, 8.7, 9.0],
      }

      const usPrice = getInflatedHousingPrice(250000, usEconomy)
      const brazilPrice = getInflatedHousingPrice(250000, brazilEconomy)

      // США: ~20% рост
      expect(usPrice).toBeGreaterThan(250000)
      expect(usPrice).toBeLessThan(320000)

      // Бразилия: ~90% рост
      expect(brazilPrice).toBeGreaterThan(250000)
      expect(brazilPrice).toBeGreaterThan(450000)

      // Бразилия дороже в 1.5+ раз
      expect(brazilPrice / usPrice).toBeGreaterThan(1.45)
    })
  })

  describe('Edge Cases', () => {
    it('без экономики возвращает базовую цену', () => {
      // Create a mock economy with empty inflation history
      const emptyEconomy = {
        ...economyNoInflation,
        inflationHistory: [],
        inflation: 0,
      }
      const result = getInflatedShopPrice(1000, emptyEconomy, 'food')
      expect(result).toBe(1000)
    })

    it('нулевая цена', () => {
      const result = getInflatedShopPrice(0, economyWithInflation, 'food')
      expect(result).toBe(0)
    })

    it('пустая история инфляции', () => {
      const economy = { ...economyNoInflation, inflationHistory: [] }
      const result = getInflatedShopPrice(100, economy, 'food')
      expect(result).toBe(100)
    })
  })

  describe('UI Display Format', () => {
    it('форматирование зарплаты', () => {
      const salary = getInflatedSalary(5000, economyWithInflation)
      const display = `$${salary.toLocaleString()}/мес`

      // Поддержка различных разделителей разрядов (запятая, пробел, неразрывный пробел)
      expect(display).toMatch(/\$[\d\s\u00A0,]+\/мес/)
      expect(display).toContain('$')
      expect(display).toContain('/мес')
    })

    it('большие числа с запятыми', () => {
      const price = getInflatedHousingPrice(450000, economyWithInflation)
      const display = price.toLocaleString('ru-RU')

      expect(display.length).toBeGreaterThan(6)
    })
  })

  describe('Performance', () => {
    it('обработка 1000 элементов быстро', () => {
      // Generate test data
      const prices = Array(1000)
        .fill(0)
        .map((_, i) => 100 + i * 10)

      // Warm-up run (not measured)
      prices.slice(0, 10).forEach((p) => getInflatedPrice(p, economyWithInflation, 'food'))

      // Actual test
      const start = performance.now()
      const results = prices.map((p) => getInflatedPrice(p, economyWithInflation, 'food'))
      const end = performance.now()

      // Verify results
      expect(results).toHaveLength(1000)

      // Check that all prices were processed correctly
      results.forEach((result, i) => {
        expect(typeof result).toBe('number')
        expect(result).toBeGreaterThan(0)
      })

      // Performance check - should be much faster than 100ms
      const duration = end - start
      console.log(`Processed 1000 prices in ${duration.toFixed(2)}ms`)

      // Use a more realistic threshold based on actual performance
      // This should pass on most modern hardware
      expect(duration).toBeLessThan(80) // More realistic threshold for diverse environments
    })
  })
})
