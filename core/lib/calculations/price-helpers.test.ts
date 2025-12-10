import { describe, it, expect } from 'vitest'
import { getInflatedPrice } from './price-helpers'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Price Helpers - Multi-Year Inflation', () => {
  it('should never decrease price over multiple years', () => {
    // Simulate inflation history: [current=3%, year-1=2.5%, year-2=2%, year-3=2.3%]
    // (stored newest to oldest)
    const economy: Partial<CountryEconomy> = {
      inflation: 3,
      inflationHistory: [3, 2.5, 2, 2.3],
      activeEvents: [],
    } as any

    const basePrice = 1200
    const price = getInflatedPrice(basePrice, economy as CountryEconomy, 'default')

    // Price must not fall
    expect(price).toBeGreaterThanOrEqual(basePrice)
  })

  it('should correctly apply cumulative inflation for food (0.5x)', () => {
    // Test case from bug report: prices should go 1200->1250->1280->...
    // With food category (0.5x multiplier)
    const inflationRates = [8.33, 4.8, 4.68]

    // Create economy with this inflation history
    // History is stored [newest, ..., oldest]
    const economy: Partial<CountryEconomy> = {
      inflation: inflationRates[0],
      inflationHistory: inflationRates.slice().reverse(), // newest first: [4.68, 4.8, 8.33]
      activeEvents: [],
    } as any

    const basePrice = 1200
    const price = getInflatedPrice(basePrice, economy as CountryEconomy, 'food')

    expect(price).toBeGreaterThanOrEqual(basePrice)
    expect(price).toBeGreaterThan(1200) // Should actually increase
  })

  it('should handle inflation history reversal correctly', () => {
    // If history is [3, 2.5, 2] (newest to oldest)
    // After reverse: [2, 2.5, 3] (oldest to newest)
    // Should calculate: base * (1+2%) * (1+2.5%) * (1+3%)

    const economy: Partial<CountryEconomy> = {
      inflation: 3,
      inflationHistory: [3, 2.5, 2], // newest first
      activeEvents: [],
    } as any

    const basePrice = 1000
    const price = getInflatedPrice(basePrice, economy as CountryEconomy, 'default')

    // Manual: 1000 * 1.02 * 1.025 * 1.03 = 1077.31 ≈ 1077

    expect(price).toBeCloseTo(1077, -1) // ±1
    expect(price).toBeGreaterThanOrEqual(basePrice)
  })

  it('should handle single inflation value correctly', () => {
    const economy: Partial<CountryEconomy> = {
      inflation: 2.5,
      inflationHistory: [2.5],
      activeEvents: [],
    } as any

    const basePrice = 1000
    const price = getInflatedPrice(basePrice, economy as CountryEconomy, 'default')

    // With only one value, should apply (length === 0 is now the skip condition)
    expect(price).toBeCloseTo(1025, 0) // Should apply 2.5% inflation
  })

  it('should apply two values correctly', () => {
    const economy: Partial<CountryEconomy> = {
      inflation: 3,
      inflationHistory: [3, 2.5], // two years
      activeEvents: [],
    } as any

    const basePrice = 1000
    const price = getInflatedPrice(basePrice, economy as CountryEconomy, 'default')

    // Should apply: 1000 * 1.025 * 1.03 = 1055.75 ≈ 1056

    expect(price).toBeGreaterThan(basePrice)
    expect(price).toBeCloseTo(1056, 0)
  })

  it('should apply inflation even with single year inflation', () => {
    // This was the BUG: if history.length === 1, price wasn't inflated
    const economy: Partial<CountryEconomy> = {
      inflation: 2.5,
      inflationHistory: [2.5], // Only current year
      activeEvents: [],
    } as any

    const basePrice = 1000
    const price = getInflatedPrice(basePrice, economy as CountryEconomy, 'default')

    // Should apply the inflation!
    expect(price).toBeGreaterThan(basePrice)
    expect(price).toBeCloseTo(1025, 0) // 1000 * 1.025
  })

  it('CRITICAL TEST: Prices never fall backwards', () => {
    const testCases = [
      {
        name: 'Steady inflation',
        history: [2.5, 2.5, 2.5],
        base: 1000,
        category: 'default' as const,
      },
      {
        name: 'Housing with high inflation',
        history: [5, 4.5, 4],
        base: 100000,
        category: 'housing' as const,
      },
      {
        name: 'Food with moderate inflation',
        history: [3, 2.8, 2.6],
        base: 500,
        category: 'food' as const,
      },
      {
        name: 'The bug scenario (food)',
        history: [4.68, 4.8, 8.33],
        base: 1200,
        category: 'food' as const,
      },
    ]

    for (const testCase of testCases) {
      const economy: Partial<CountryEconomy> = {
        inflation: testCase.history[0],
        inflationHistory: testCase.history,
        activeEvents: [],
      } as any

      const price = getInflatedPrice(testCase.base, economy as CountryEconomy, testCase.category)

      expect(
        price,
        `FAIL: ${testCase.name} - price fell from ${testCase.base} to ${price}`,
      ).toBeGreaterThanOrEqual(testCase.base)
    }
  })

  it('10-year inflation test - prices only increase', () => {
    // 10 years: matching the inflation from test above
    const tenYearInflation = [2.7, 2.3, 2.5, 2.8, 2.6, 2.2, 2.4, 2.5, 2.3, 2.1]

    const economy: Partial<CountryEconomy> = {
      inflation: 2.7,
      inflationHistory: tenYearInflation,
      activeEvents: [],
    } as any

    const testCases = [
      { base: 1000, category: 'default' as const, expected: 1273 },
      { base: 1200, category: 'food' as const, expected: 1350 },
      { base: 100000, category: 'housing' as const, expected: 143249 },
    ]

    for (const { base, category, expected } of testCases) {
      const price = getInflatedPrice(base, economy as CountryEconomy, category)

      // Price must increase
      expect(price).toBeGreaterThanOrEqual(base)
      // Should be close to expected (within 10%)
      expect(price).toBeGreaterThan(expected * 0.9)
    }

  })
})
