import { describe, it, expect } from 'vitest'

import { getInflatedEducationPrice } from '@/core/lib/calculations/price-helpers'
import { getAllCoursesForCountry } from '@/core/lib/data-loaders/courses-loader'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Education Price Inflation Tests', () => {
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
    inflationHistory: []
  }

  const mockEconomyWithInflation: CountryEconomy = {
    ...mockEconomyNoInflation,
    inflation: 2.5,
    inflationHistory: [2.5, 2.3]
  }

  describe('getInflatedEducationPrice', () => {
    it('должна вернуть базовую цену без инфляции', () => {
      const basePrice = 2200
      const result = getInflatedEducationPrice(basePrice, mockEconomyNoInflation)
      
      expect(result).toBe(basePrice)
    })

    it('должна применить инфляцию к цене курса', () => {
      const basePrice = 2200
      const result = getInflatedEducationPrice(basePrice, mockEconomyWithInflation)
      
      expect(result).toBeGreaterThan(basePrice)
      expect(result).toBeCloseTo(2329, -2)
    })

    it('должна применить инфляцию к университету', () => {
      const basePrice = 18000
      const result = getInflatedEducationPrice(basePrice, mockEconomyWithInflation)
      
      expect(result).toBeGreaterThan(basePrice)
      expect(result).toBeCloseTo(19063, -2)
    })
  })

  describe('Загрузка курсов', () => {
    it('должна загрузить курсы для US', () => {
      const courses = getAllCoursesForCountry('us')
      
      expect(courses.length).toBeGreaterThan(0)
      expect(courses[0]).toHaveProperty('id')
      expect(courses[0]).toHaveProperty('name')
      expect(courses[0]).toHaveProperty('cost')
    })

    it('все курсы должны иметь корректную структуру', () => {
      const courses = getAllCoursesForCountry('us')
      
      courses.forEach(course => {
        expect(typeof course.cost).toBe('number')
        expect(course.cost).toBeGreaterThan(0)
        expect(typeof course.duration).toBe('number')
        expect(course.duration).toBeGreaterThan(0)
        expect(course.skillName).toBeDefined()
      })
    })
  })

  describe('Реалистичность цен с инфляцией', () => {
    it('Python курс должен расти реалистично', () => {
      const basePrice = 2200
      const inflated = getInflatedEducationPrice(basePrice, mockEconomyWithInflation)
      
      const growthPercent = ((inflated - basePrice) / basePrice) * 100
      expect(growthPercent).toBeGreaterThan(5)
      expect(growthPercent).toBeLessThan(7)
    })

    it('Университет должен расти пропорционально', () => {
      const basePrice = 18000
      const inflated = getInflatedEducationPrice(basePrice, mockEconomyWithInflation)
      
      const growthPercent = ((inflated - basePrice) / basePrice) * 100
      expect(growthPercent).toBeGreaterThan(5)
      expect(growthPercent).toBeLessThan(7)
    })
  })
})
