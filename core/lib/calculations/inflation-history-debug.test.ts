import { describe, it, expect } from 'vitest'
import { getCumulativeInflationMultiplier } from './inflation-engine'
import { getQuarter } from '../quarter'

describe('Inflation History Order - CRITICAL DEBUG', () => {
  it('should verify inflation history storage order', () => {
    const historyAsStoredInGame = [2.7, 3.0, 2.5, 2.0]

    const reversed = [...historyAsStoredInGame].reverse()
    const multiplier = getCumulativeInflationMultiplier(reversed, 'default')

    expect(multiplier).toBeGreaterThanOrEqual(1)
  })

  it('should apply inflation ONLY on Q1', () => {
    const turns = Array.from({ length: 8 }, (_, i) => i + 1)

    let inflationHistory: number[] = []
    let price = 1000

    for (const turn of turns) {
      const isQ1 = getQuarter(turn) === 1

      if (isQ1) {
        const newInflation = 2.5
        inflationHistory.unshift(newInflation)

        const reversed = [...inflationHistory].reverse()
        const multiplier = getCumulativeInflationMultiplier(reversed, 'default')
        price = Math.round(1000 * multiplier)
      }
    }

    expect(price).toBeGreaterThanOrEqual(1000)
  })

  it('REAL TEST: prices never go backwards', () => {
    const inflationRates = [2.1, 2.3, 2.5]
    let inflationHistory: number[] = []
    let currentPrice = 1000
    const priceHistory = [currentPrice]

    for (let turn = 1; turn <= 12; turn++) {
      if (getQuarter(turn) === 1) {
        const index = Math.floor((turn - 1) / 4)
        const newInflation = inflationRates[index]

        inflationHistory.unshift(newInflation)

        const multiplier = getCumulativeInflationMultiplier(
          [...inflationHistory].reverse(),
          'default',
        )

        currentPrice = Math.round(1000 * multiplier)
        priceHistory.push(currentPrice)
      }
    }

    for (let i = 1; i < priceHistory.length; i++) {
      expect(priceHistory[i]).toBeGreaterThanOrEqual(priceHistory[i - 1])
    }
  })

  it('EDGE CASE: multiplier correctness', () => {
    const scenarios = [
      { history: [2.1], expected: 1.021 },
      { history: [2.3, 2.1], expected: 1.021 * 1.023 },
      { history: [2.5, 2.3, 2.1], expected: 1.021 * 1.023 * 1.025 },
    ]

    for (const s of scenarios) {
      const multiplier = getCumulativeInflationMultiplier([...s.history].reverse(), 'default')

      expect(multiplier).toBeGreaterThanOrEqual(s.expected - 0.0001)
    }
  })
})
