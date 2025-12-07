import { describe, it, expect } from 'vitest'
import {
  getCumulativeInflationMultiplier,
  applyInflationToPrice,
  applyYearlyInflation,
  INFLATION_MULTIPLIERS,
} from './inflation-system'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Inflation System', () => {
  describe('getCumulativeInflationMultiplier', () => {
    it('should calculate compound inflation correctly for default category', () => {
      // Инфляция 3% и 4% должна дать: 1.03 * 1.04 = 1.0712
      const history = [3, 4]
      const multiplier = getCumulativeInflationMultiplier(history, 'default')
      expect(multiplier).toBeCloseTo(1.03 * 1.04, 4)
    })

    it('should apply category multiplier correctly', () => {
      // Жилье с multiplier 1.5: инфляция 3% -> эффективная 4.5%
      const history = [3]
      const multiplier = getCumulativeInflationMultiplier(history, 'housing')
      const expected = 1 + (3 * INFLATION_MULTIPLIERS.housing) / 100
      expect(multiplier).toBeCloseTo(expected, 4)
    })

    it('should handle multiple years with compound inflation', () => {
      // Год 1: 3%, Год 2: 4%, Год 3: 5%
      // Результат: 1.03 * 1.04 * 1.05 = 1.12476
      const history = [3, 4, 5]
      const multiplier = getCumulativeInflationMultiplier(history, 'default')
      expect(multiplier).toBeCloseTo(1.03 * 1.04 * 1.05, 4)
    })

    it('should handle food category with lower multiplier', () => {
      // Еда с multiplier 0.7: инфляция 3% -> эффективная 2.1%
      const history = [3]
      const multiplier = getCumulativeInflationMultiplier(history, 'food')
      const expected = 1 + (3 * INFLATION_MULTIPLIERS.food) / 100
      expect(multiplier).toBeCloseTo(expected, 4)
    })
  })

  describe('applyInflationToPrice', () => {
    const createEconomy = (
      inflation: number,
      inflationHistory: number[],
      baseYear: number = 2024,
    ): CountryEconomy => ({
      id: 'us',
      name: 'USA',
      archetype: 'rich_stable',
      gdpGrowth: 2,
      inflation,
      stockMarketInflation: 7,
      keyRate: 5,
      interestRate: 5,
      unemployment: 4,
      taxRate: 20,
      corporateTaxRate: 20,
      salaryModifier: 1,
      costOfLivingModifier: 1,
      activeEvents: [],
      inflationHistory,
      baseYear,
    })

    it('should return base price for current year equal to base year', () => {
      const economy = createEconomy(3, [3], 2024)
      const price = applyInflationToPrice(1000, economy, 'default', 2024, 2024)
      expect(price).toBe(1000)
    })

    it('should apply inflation for one year', () => {
      // Базовая цена 1000, инфляция 3% за 2025 год
      const economy = createEconomy(3, [3, 3], 2024)
      const price = applyInflationToPrice(1000, economy, 'default', 2024, 2025)
      // Должна примениться только инфляция 2025 года (второй элемент)
      expect(price).toBe(1030) // 1000 * 1.03
    })

    it('should apply compound inflation for multiple years', () => {
      // Базовая цена 1000
      // 2024 (базовый): 3%
      // 2025: 4%
      // 2026: 5%
      // Результат: 1000 * 1.04 * 1.05 = 1092
      const economy = createEconomy(5, [3, 4, 5], 2024)
      const price = applyInflationToPrice(1000, economy, 'default', 2024, 2026)
      expect(price).toBe(1092) // 1000 * 1.04 * 1.05 = 1092
    })

    it('should apply housing inflation with multiplier', () => {
      // Жилье: multiplier 1.5
      // Инфляция 3% -> эффективная 4.5%
      const economy = createEconomy(3, [3, 3], 2024)
      const price = applyInflationToPrice(100000, economy, 'housing', 2024, 2025)
      const expected = 100000 * (1 + (3 * INFLATION_MULTIPLIERS.housing) / 100)
      expect(price).toBe(Math.round(expected))
    })

    it('should handle price bought in later year', () => {
      // Цена куплена в 2025 году (baseYear = 2025)
      // В 2026 году должна примениться только инфляция 2026 года
      const economy = createEconomy(5, [3, 4, 5], 2024)
      const price = applyInflationToPrice(1000, economy, 'default', 2025, 2026)
      // Должна примениться только инфляция 2026 года (третий элемент, индекс 2)
      expect(price).toBe(1050) // 1000 * 1.05
    })

    it('should correctly select relevant history for multiple years', () => {
      // История: [3, 4, 5, 6] (2024, 2025, 2026, 2027)
      // baseYear = 2024, currentYear = 2026
      // Должны взять [4, 5] (индексы 1, 2)
      const economy = createEconomy(6, [3, 4, 5, 6], 2024)
      const price = applyInflationToPrice(1000, economy, 'default', 2024, 2026)
      expect(price).toBe(1092) // 1000 * 1.04 * 1.05 = 1092
    })

    it('should handle long history correctly', () => {
      // История: [3, 4, 5, 6, 7] (2024-2028)
      // baseYear = 2024, currentYear = 2027
      // yearsPassed = 3, значит берем инфляции за 2025, 2026, 2027 -> [4, 5, 6] (индексы 1-3)
      const economy = createEconomy(7, [3, 4, 5, 6, 7], 2024)
      const price = applyInflationToPrice(1000, economy, 'default', 2024, 2027)
      // Должны примениться инфляции за 2025 (4%), 2026 (5%), 2027 (6%)
      const expected = 1000 * 1.04 * 1.05 * 1.06
      expect(price).toBe(Math.round(expected))
    })
  })

  describe('Sequential inflation application', () => {
    it('should apply inflation correctly over multiple years with compound growth', () => {
      // Симулируем несколько лет инфляции с фиксированными значениями
      // Используем прямое обновление истории для предсказуемости
      let economy: CountryEconomy = {
        id: 'us',
        name: 'USA',
        archetype: 'rich_stable',
        gdpGrowth: 2,
        inflation: 3,
        stockMarketInflation: 7,
        keyRate: 5,
        interestRate: 5,
        unemployment: 4,
        taxRate: 20,
        corporateTaxRate: 20,
        salaryModifier: 1,
        costOfLivingModifier: 1,
        activeEvents: [],
        inflationHistory: [3, 4], // 2024: 3%, 2025: 4%
        baseYear: 2024,
      }

      const basePrice = 1000

      // Год 1 (2025): инфляция 4%
      let price1 = applyInflationToPrice(basePrice, economy, 'default', 2024, 2025)
      expect(price1).toBe(1040) // 1000 * 1.04

      // Обновляем экономику для следующего года
      economy = {
        ...economy,
        inflation: 5,
        inflationHistory: [3, 4, 5], // 2024: 3%, 2025: 4%, 2026: 5%
      }

      // Год 2 (2026): инфляция 5%
      let price2 = applyInflationToPrice(basePrice, economy, 'default', 2024, 2026)
      expect(price2).toBe(1092) // 1000 * 1.04 * 1.05

      // Обновляем экономику для следующего года
      economy = {
        ...economy,
        inflation: 6,
        inflationHistory: [3, 4, 5, 6], // 2024: 3%, 2025: 4%, 2026: 5%, 2027: 6%
      }

      // Год 3 (2027): инфляция 6%
      let price3 = applyInflationToPrice(basePrice, economy, 'default', 2024, 2027)
      expect(price3).toBe(1158) // 1000 * 1.04 * 1.05 * 1.06

      // Проверяем, что каждая следующая цена больше предыдущей (compound inflation)
      expect(price2).toBeGreaterThan(price1)
      expect(price3).toBeGreaterThan(price2)

      // Проверяем, что рост нелинейный (compound эффект)
      const growth1to2 = price2 - price1 // 52
      const growth2to3 = price3 - price2 // 66
      expect(growth2to3).toBeGreaterThan(growth1to2) // Compound inflation: рост ускоряется
    })
  })

  describe('Inflation never goes negative', () => {
    it('should never generate negative inflation', () => {
      const economy: CountryEconomy = {
        id: 'us',
        name: 'USA',
        archetype: 'rich_stable',
        gdpGrowth: 2,
        inflation: 1, // Низкая инфляция
        stockMarketInflation: 7,
        keyRate: 5,
        interestRate: 5,
        unemployment: 4,
        taxRate: 20,
        corporateTaxRate: 20,
        salaryModifier: 1,
        costOfLivingModifier: 1,
        activeEvents: [
          {
            id: 'test',
            type: 'recession',
            title: 'Test',
            description: 'Test',
            turn: 1,
            duration: 4,
            effects: { inflationChange: -5 }, // Сильное отрицательное событие
          },
        ],
        inflationHistory: [1],
        baseYear: 2024,
      }

      // Генерируем инфляцию много раз, чтобы проверить, что она никогда не станет отрицательной
      for (let i = 0; i < 100; i++) {
        const result = applyYearlyInflation(economy, 2025)
        expect(result.newEconomy.inflation).toBeGreaterThanOrEqual(0)
        expect(result.newEconomy.inflation).toBeGreaterThanOrEqual(1) // Минимум для US
      }
    })

    it('should never reduce prices due to inflation', () => {
      // Создаем экономику с историей инфляции, где значения могут быть низкими, но не отрицательными
      const economy: CountryEconomy = {
        id: 'us',
        name: 'USA',
        archetype: 'rich_stable',
        gdpGrowth: 2,
        inflation: 1,
        stockMarketInflation: 7,
        keyRate: 5,
        interestRate: 5,
        unemployment: 4,
        taxRate: 20,
        corporateTaxRate: 20,
        salaryModifier: 1,
        costOfLivingModifier: 1,
        activeEvents: [],
        inflationHistory: [3, 2, 1], // Инфляция снижается, но остается положительной
        baseYear: 2024,
      }
      const basePrice = 1000

      // Даже если инфляция снижается, цена не должна падать (только расти медленнее)
      const price1 = applyInflationToPrice(basePrice, economy, 'default', 2024, 2025)
      const price2 = applyInflationToPrice(basePrice, economy, 'default', 2024, 2026)
      const price3 = applyInflationToPrice(basePrice, economy, 'default', 2024, 2027)

      // Цены должны расти или оставаться на месте, но никогда не падать
      expect(price1).toBeGreaterThanOrEqual(basePrice)
      expect(price2).toBeGreaterThanOrEqual(price1)
      expect(price3).toBeGreaterThanOrEqual(price2)
    })
  })

  describe('applyYearlyInflation', () => {
    it('should add new inflation to history', () => {
      const economy: CountryEconomy = {
        id: 'us',
        name: 'USA',
        archetype: 'rich_stable',
        gdpGrowth: 2,
        inflation: 3,
        stockMarketInflation: 7,
        keyRate: 5,
        interestRate: 5,
        unemployment: 4,
        taxRate: 20,
        corporateTaxRate: 20,
        salaryModifier: 1,
        costOfLivingModifier: 1,
        activeEvents: [],
        inflationHistory: [3],
        baseYear: 2024,
      }

      const result = applyYearlyInflation(economy, 2025)

      // История должна содержать новую и старую инфляцию (новая в начале!)
      expect(result.newEconomy.inflationHistory).toHaveLength(2)
      expect(result.newEconomy.inflationHistory![0]).toBeGreaterThan(0) // Новая инфляция в начале
      expect(result.newEconomy.inflationHistory![1]).toBe(3) // Базовая инфляция в конце
    })

    it('should update inflation and key rate', () => {
      const economy: CountryEconomy = {
        id: 'us',
        name: 'USA',
        archetype: 'rich_stable',
        gdpGrowth: 2,
        inflation: 3,
        stockMarketInflation: 7,
        keyRate: 5,
        interestRate: 5,
        unemployment: 4,
        taxRate: 20,
        corporateTaxRate: 20,
        salaryModifier: 1,
        costOfLivingModifier: 1,
        activeEvents: [],
        inflationHistory: [3],
        baseYear: 2024,
      }

      const result = applyYearlyInflation(economy, 2025)

      expect(result.newEconomy.inflation).not.toBe(economy.inflation)
      expect(result.newEconomy.keyRate).not.toBe(economy.keyRate)
      expect(result.inflationChange).not.toBe(0)
      expect(result.keyRateChange).not.toBe(0)
    })
  })
})
