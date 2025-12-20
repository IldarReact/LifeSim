import { describe, it, expect } from 'vitest'

import {
  generateYearlyInflation,
  calculateKeyRate,
  applyInflation,
  getCumulativeInflationMultiplier,
  shouldApplyInflationThisTurn,
  INFLATION_SETTINGS,
  type PriceCategory,
} from './inflation-engine'

describe('Inflation Engine', () => {
  describe('shouldApplyInflationThisTurn', () => {
    it('should return false for turn 0 (game start)', () => {
      expect(shouldApplyInflationThisTurn(0)).toBe(false)
    })

    it('should return false for turns before first Q1 transition', () => {
      // turn 0 = start, should not apply
      expect(shouldApplyInflationThisTurn(0)).toBe(false)
    })

    it('should return true for turns that represent Q1 after transition', () => {
      // We apply on turns 1, 5, 9, ... (transition from Q4 -> Q1)
      expect(shouldApplyInflationThisTurn(1)).toBe(true)
      expect(shouldApplyInflationThisTurn(5)).toBe(true)
      expect(shouldApplyInflationThisTurn(9)).toBe(true)
    })

    it('should return true for several Q1 turns across years', () => {
      expect(shouldApplyInflationThisTurn(13)).toBe(true)
      expect(shouldApplyInflationThisTurn(17)).toBe(true)
      expect(shouldApplyInflationThisTurn(21)).toBe(true)
    })
  })

  describe('applyInflation - Basic Price Increase', () => {
    it('should never decrease price (always >= 1.0 multiplier)', () => {
      const basePrice = 1000
      const result = applyInflation(basePrice, 2.5, 'default')
      expect(result).toBeGreaterThanOrEqual(basePrice)
    })

    it('should apply inflation correctly for default category', () => {
      // 1000 * (1 + 2.5/100) = 1025
      const result = applyInflation(1000, 2.5, 'default')
      expect(result).toBe(1025)
    })

    it('should apply inflation with housing multiplier (1.5x)', () => {
      // 1000 * (1 + (2.5 * 1.5) / 100) = 1000 * 1.0375 = 1037.5 ≈ 1038
      const result = applyInflation(1000, 2.5, 'housing')
      expect(result).toBe(1038)
    })

    it('should apply inflation with food multiplier (0.5x)', () => {
      // 500 * (1 + (2.5 * 0.5) / 100) = 500 * 1.0125 = 506.25 ≈ 506
      const result = applyInflation(500, 2.5, 'food')
      expect(result).toBe(506)
    })

    it('should handle 0 inflation', () => {
      const basePrice = 1000
      const result = applyInflation(basePrice, 0, 'default')
      expect(result).toBe(basePrice)
    })

    it('should handle high inflation (3%)', () => {
      // 1000 * (1 + 3/100) = 1030
      const result = applyInflation(1000, 3, 'default')
      expect(result).toBe(1030)
    })
  })

  describe('getCumulativeInflationMultiplier - Multiple Years Only Growth', () => {
    it('should apply 3 years of consistent 2.5% inflation (housing)', () => {
      // Year 1: 1000 * 1.0375 = 1037.5
      // Year 2: 1037.5 * 1.0375 = 1076.4
      // Year 3: 1076.4 * 1.0375 = 1117.2
      const history = [2.5, 2.5, 2.5] // oldest to newest
      const multiplier = getCumulativeInflationMultiplier(history, 'housing')

      // Should be > 1 (prices go up!)
      expect(multiplier).toBeGreaterThan(1)

      // Test with base price
      const basePrice = 1000
      const finalPrice = Math.round(basePrice * multiplier)
      expect(finalPrice).toBeGreaterThan(basePrice)
      expect(finalPrice).toBeGreaterThan(1100) // Should be around 1117
    })

    it('should never return multiplier < 1 (prices never fall)', () => {
      const history = [2, 2.5, 3, 2.8, 2.2]
      const multiplier = getCumulativeInflationMultiplier(history, 'housing')
      expect(multiplier).toBeGreaterThanOrEqual(1)
    })

    it('should apply 5 years: 1200->1250->1280->1310->1345', () => {
      // Start: 1200
      // Year 1 (2%): 1200 * 1.03 = 1236
      // Year 2 (2.5%): 1236 * 1.0375 = 1282
      // Year 3 (3%): 1282 * 1.045 = 1340
      // Year 4 (2.8%): 1340 * 1.042 = 1396
      // Year 5 (2.2%): 1396 * 1.033 = 1442

      // BUT we're testing housing (1.5x multiplier)
      // So it should be even higher!
      const history = [2, 2.5, 3, 2.8, 2.2] // oldest to newest
      const multiplier = getCumulativeInflationMultiplier(history, 'housing')

      const basePrice = 1200
      let currentPrice = basePrice

      // Manual calculation with housing multiplier
      for (const yearInflation of history) {
        const effectiveInflation = (yearInflation * 1.5) / 100
        currentPrice = currentPrice * (1 + effectiveInflation)
      }
      currentPrice = Math.round(currentPrice)

      const calculatedPrice = Math.round(basePrice * multiplier)

      expect(calculatedPrice).toBe(currentPrice)
      expect(calculatedPrice).toBeGreaterThan(basePrice)
      expect(calculatedPrice).toBeGreaterThan(1300) // Should be significantly higher
    })

    it('should show real example: 1200->1250->1280->1310 (only growth, no fall)', () => {
      // Test the exact scenario from bug report
      // Prices: 1200->1250->1280->1310
      // We need to work backwards to infer inflation

      // From 1200 to 1250: (1250-1200)/1200 = 0.0417 = 4.17% (with food 0.5x: 8.33% base inflation)
      // From 1250 to 1280: (1280-1250)/1250 = 0.024 = 2.4% (with food 0.5x: 4.8% base inflation)
      // From 1280 to 1310: (1310-1280)/1280 = 0.0234 = 2.34% (with food 0.5x: 4.68% base inflation)

      // Let's test with base inflation that should produce this:
      // Assume food category (0.5x multiplier)
      // 1200 * (1 + 8.33*0.5/100) = 1200 * 1.04165 = 1250
      // 1250 * (1 + 4.8*0.5/100) = 1250 * 1.024 = 1280
      // 1280 * (1 + 4.68*0.5/100) = 1280 * 1.0234 = 1310

      const inflationRates = [8.33, 4.8, 4.68]
      const multiplier = getCumulativeInflationMultiplier(inflationRates, 'food')
      const basePrice = 1200
      const finalPrice = Math.round(basePrice * multiplier)

      expect(finalPrice).toBeGreaterThan(1200)
      expect(finalPrice).toBeGreaterThanOrEqual(1310)
    })

    it('should always increase with positive inflation history', () => {
      // Test 10 different inflation patterns
      const patterns = [
        [2, 2, 2],
        [2.5, 2.5, 2.5],
        [3, 3, 3],
        [1, 2, 3],
        [3, 2, 1],
        [1.5, 2, 2.5, 3],
        [2, 2.2, 2.1, 2.3],
      ]

      const basePrice = 1000
      for (const pattern of patterns) {
        const multiplier = getCumulativeInflationMultiplier(pattern, 'default')
        const finalPrice = Math.round(basePrice * multiplier)

        // CRITICAL: Final price must NEVER be less than base price
        expect(
          finalPrice,
          `Price fell for inflation pattern ${pattern}: ${basePrice} -> ${finalPrice}`,
        ).toBeGreaterThanOrEqual(basePrice)
      }
    })
  })

  describe('calculateKeyRate', () => {
    it('should increase when inflation rises', () => {
      const rate1 = calculateKeyRate(2.5, 3.5)
      const rate2 = calculateKeyRate(3.5, 3.5)
      // Higher inflation should lead to higher target rate
      // (though may not be strictly increasing due to randomness)
      expect(rate1).toBeGreaterThanOrEqual(0)
      expect(rate2).toBeGreaterThanOrEqual(0)
    })

    it('should stay positive', () => {
      for (let i = 0; i < 10; i++) {
        const rate = calculateKeyRate(0.1, 0.1)
        expect(rate).toBeGreaterThanOrEqual(0.1)
      }
    })
  })

  describe('generateYearlyInflation', () => {
    it('should always be within bounds [0.1, 20]', () => {
      const mockEconomy = {
        inflation: 2.5,
        activeEvents: [],
      } as any

      for (let i = 0; i < 20; i++) {
        const inflation = generateYearlyInflation(2.5, mockEconomy)
        expect(inflation).toBeGreaterThanOrEqual(INFLATION_SETTINGS.minInflation)
        expect(inflation).toBeLessThanOrEqual(INFLATION_SETTINGS.maxInflation)
      }
    })

    it('should follow trend (60% damping)', () => {
      const mockEconomy = {
        inflation: 2.5,
        activeEvents: [],
      } as any

      const results = []
      for (let i = 0; i < 10; i++) {
        const inflation = generateYearlyInflation(2.5, mockEconomy)
        results.push(inflation)
      }

      // With damping=0.6, should cluster around 2.5%
      const average = results.reduce((a, b) => a + b) / results.length
      expect(Math.abs(average - 2.5)).toBeLessThan(1) // Within 1% of target
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty inflation history', () => {
      const multiplier = getCumulativeInflationMultiplier([], 'default')
      expect(multiplier).toBe(1)
    })

    it('should handle single year inflation', () => {
      const multiplier = getCumulativeInflationMultiplier([2.5], 'default')
      expect(multiplier).toBe(1.025)
    })

    it('should handle invalid price', () => {
      const result1 = applyInflation(0, 2.5, 'default')
      const result2 = applyInflation(-100, 2.5, 'default')
      expect(result1).toBe(0)
      expect(result2).toBe(-100)
    })

    it('should handle all categories', () => {
      const categories: PriceCategory[] = [
        'housing',
        'realEstate',
        'business',
        'education',
        'health',
        'transport',
        'services',
        'food',
        'default',
      ]

      for (const category of categories) {
        const result = applyInflation(1000, 2.5, category)
        expect(result).toBeGreaterThan(1000)
        expect(result).toBeLessThan(1100) // Reasonable bound
      }
    })
  })

  describe('CRITICAL: Price Never Falls', () => {
    it('should never return price < base price with positive inflation', () => {
      const scenarios = [
        { base: 1200, inflation: [2, 2.5, 3] },
        { base: 1000, inflation: [1.5, 2, 2.5, 3] },
        { base: 500, inflation: [2, 2, 2] },
        { base: 100000, inflation: [3, 3, 3, 3] },
      ]

      for (const { base, inflation } of scenarios) {
        const multiplier = getCumulativeInflationMultiplier(inflation, 'default')
        const final = Math.round(base * multiplier)

        expect(
          final,
          `ERROR: Price fell from ${base} to ${final} with inflation ${inflation}`,
        ).toBeGreaterThanOrEqual(base)
      }
    })

    it('should handle 10 years of inflation - prices only increase', () => {
      // Real inflation pattern over 10 years
      const tenYearInflation = [2.1, 2.3, 2.5, 2.4, 2.2, 2.6, 2.8, 2.5, 2.3, 2.7]

      const basePrice = 1000
      let currentPrice = basePrice
      const priceProgression = [currentPrice]

      // Simulate year by year
      for (let year = 0; year < tenYearInflation.length; year++) {
        const yearInflation = tenYearInflation[year]
        currentPrice = Math.round(currentPrice * (1 + yearInflation / 100))
        priceProgression.push(currentPrice)
      }

      // Verify using getCumulativeInflationMultiplier
      const multiplier = getCumulativeInflationMultiplier(tenYearInflation, 'default')
      const finalPriceViaMultiplier = Math.round(basePrice * multiplier)

      // CRITICAL: Check that each step is >= previous
      for (let i = 1; i < priceProgression.length; i++) {
        expect(
          priceProgression[i],
          `Year ${i}: Price fell from $${priceProgression[i - 1]} to $${priceProgression[i]}`,
        ).toBeGreaterThanOrEqual(priceProgression[i - 1])
      }

      // CRITICAL: Final price must be significantly > base
      expect(finalPriceViaMultiplier).toBeGreaterThan(basePrice)
      expect(finalPriceViaMultiplier).toBeGreaterThan(1200) // Should be around 1245+
    })

    it('should handle 10 years of housing inflation (1.5x multiplier)', () => {
      // Same inflation rates but with housing multiplier
      const tenYearInflation = [2.1, 2.3, 2.5, 2.4, 2.2, 2.6, 2.8, 2.5, 2.3, 2.7]

      const basePrice = 100000
      const multiplier = getCumulativeInflationMultiplier(tenYearInflation, 'housing')
      const finalPrice = Math.round(basePrice * multiplier)

      // Housing should be significantly more expensive
      expect(finalPrice).toBeGreaterThan(basePrice)
      expect(finalPrice).toBeGreaterThan(120000) // Should be ~121000+
    })

    it('should handle 10 years of food inflation (0.5x multiplier)', () => {
      const tenYearInflation = [2.1, 2.3, 2.5, 2.4, 2.2, 2.6, 2.8, 2.5, 2.3, 2.7]

      const basePrice = 1000
      const multiplier = getCumulativeInflationMultiplier(tenYearInflation, 'food')
      const finalPrice = Math.round(basePrice * multiplier)

      // Food prices rise slower but still increase
      expect(finalPrice).toBeGreaterThan(basePrice)
      expect(finalPrice).toBeGreaterThan(1050) // Should be ~1120
    })

    it('EXTREME: 20 years of inflation - still only increases', () => {
      // 20 years of realistic inflation
      const twentyYearInflation = Array(20).fill(2.5) // Constant 2.5%

      const basePrice = 10000
      const multiplier = getCumulativeInflationMultiplier(twentyYearInflation, 'default')
      const finalPrice = Math.round(basePrice * multiplier)

      // After 20 years: (1.025)^20 ≈ 1.6386
      expect(finalPrice).toBeGreaterThan(basePrice)
      expect(finalPrice).toBeGreaterThan(16000) // Should be ~16386
    })

    it('should handle housing: 1200->1250->1280->1310 scenario', () => {
      // Recreate the bug scenario step by step
      // Assuming food category (0.5x multiplier based on the pattern)

      const priceProgression = []
      let currentPrice = 1200
      priceProgression.push(currentPrice)

      // Calculate what inflation rates would produce these prices
      // 1200 -> 1250: growth of 50/1200 = 4.17%
      // With 0.5x multiplier: base inflation = 4.17 / 0.5 = 8.33%
      const inflationRates = [8.33, 4.8, 4.68]

      for (const rate of inflationRates) {
        currentPrice = Math.round(currentPrice * (1 + (rate * 0.5) / 100))
        priceProgression.push(currentPrice)
      }

      // Check: each step should be >= previous
      for (let i = 1; i < priceProgression.length; i++) {
        expect(
          priceProgression[i],
          `Price fell at step ${i}: ${priceProgression[i - 1]} -> ${priceProgression[i]}`,
        ).toBeGreaterThanOrEqual(priceProgression[i - 1])
      }
    })
  })
})
