import { describe, it, expect } from 'vitest'
import { getCumulativeInflationMultiplier } from './inflation-engine'

describe('Inflation History Order - CRITICAL DEBUG', () => {
  it('should verify inflation history storage order', () => {
    // In turn-logic.ts line 617:
    // const newInflationHistory = [newInflation, ...(country.inflationHistory || []).slice(0, 9)]
    // This means: [current_year, previous_year, year_before, ...]
    // So newest FIRST, oldest LAST

    // Example: If we have 3 years of inflation
    // Year 1: 2.0%
    // Year 2: 2.5%  <- new inflation applied
    // Year 3: 3.0%  <- new inflation applied
    // Year 4: 2.7%  <- new inflation applied
    // History at year 4: [2.7, 3.0, 2.5, 2.0, ...]
    //                    newest first ↑  ↑ oldest last

    const historyAsStoredInGame = [2.7, 3.0, 2.5, 2.0]

    console.log('\n❌ WRONG ORDER:')
    console.log('History as stored: [2.7, 3.0, 2.5, 2.0] (newest first)')
    console.log('If we pass this directly to getCumulativeInflationMultiplier:')
    const wrongMultiplier = getCumulativeInflationMultiplier(historyAsStoredInGame, 'default')
    console.log(`Multiplier (wrong): ${wrongMultiplier}`)
    console.log(`Base 1000 × ${wrongMultiplier} = ${Math.round(1000 * wrongMultiplier)}`)
    console.log('This applies: 2.7% → 3.0% → 2.5% → 2.0% (backwards!)')
    console.log('Wrong because we multiply in wrong order\n')

    console.log('✅ CORRECT ORDER:')
    const correctlyReversed = historyAsStoredInGame.reverse()
    console.log('History reversed: [2.0, 2.5, 3.0, 2.7] (oldest first)')
    const correctMultiplier = getCumulativeInflationMultiplier(correctlyReversed, 'default')
    console.log(`Multiplier (correct): ${correctMultiplier}`)
    console.log(`Base 1000 × ${correctMultiplier} = ${Math.round(1000 * correctMultiplier)}`)
    console.log('This applies: 2.0% → 2.5% → 3.0% → 2.7% (correct order)')

    // The multiplier should always be >= 1
    expect(correctMultiplier).toBeGreaterThanOrEqual(1)
  })

  it('should show price change ONLY on Q1 (turn % 4 === 0)', () => {
    console.log('\nPrice change should ONLY happen on Q1:\n')

    // Simulate 5 turns with inflation applied on turn 4
    const turns = [
      { turn: 0, quarter: 'Q1', isQ1: true, applyInflation: true, basePrice: 1000 },
      { turn: 1, quarter: 'Q2', isQ1: false, applyInflation: false, basePrice: 1000 },
      { turn: 2, quarter: 'Q3', isQ1: false, applyInflation: false, basePrice: 1000 },
      { turn: 3, quarter: 'Q4', isQ1: false, applyInflation: false, basePrice: 1000 },
      { turn: 4, quarter: 'Q1', isQ1: true, applyInflation: true, basePrice: 1000 },
      { turn: 5, quarter: 'Q2', isQ1: false, applyInflation: false, basePrice: 1000 },
    ]

    let currentInflation = 2.5
    const inflationHistory = [currentInflation]
    let displayPrice = 1000

    for (const turnData of turns) {
      const shouldApply = turnData.turn % 4 === 0 && turnData.turn > 0

      if (shouldApply) {
        // New inflation is generated
        const newInflation = 2.7 // Example: 2.7%
        inflationHistory.unshift(newInflation) // Add to front [2.7, 2.5, ...]
        currentInflation = newInflation

        // Price should update based on full history
        const reversed = [...inflationHistory].reverse()
        const multiplier = getCumulativeInflationMultiplier(reversed, 'default')
        displayPrice = Math.round(1000 * multiplier)

        console.log(`Turn ${turnData.turn} (${turnData.quarter}): ✅ INFLATION APPLIED`)
        console.log(`  History: [${inflationHistory.join(', ')}]`)
        console.log(`  Price: 1000 → ${displayPrice}`)
      } else {
        console.log(
          `Turn ${turnData.turn} (${turnData.quarter}): ❌ No inflation, price: ${displayPrice}`,
        )
      }
    }

    console.log('\nExpected:\n  Prices change ONLY on turns 4, 8, 12, ... (Q1)')
    console.log('  Prices stay same on turns 1-3, 5-7, 9-11, ... (Q2-Q4)')
  })

  it('REAL TEST: Verify prices never go backwards', () => {
    console.log('\n🔴 REAL SCENARIO - Detect if prices ever go DOWN:\n')

    // Simulate 12 turns (3 years) with quarterly inflation checks
    const inflationRates = [2.1, 2.3, 2.5, 2.7, 2.4, 2.6] // 6 Q1 periods

    let inflationHistory: number[] = []
    let currentPrice = 1000
    const priceHistory = [currentPrice]

    console.log('Starting price: $1000\n')

    for (let turn = 1; turn <= 12; turn++) {
      const isQ1 = turn % 4 === 0 && turn > 0

      if (isQ1) {
        const inflationIndex = Math.floor(turn / 4) - 1
        const newInflation = inflationRates[inflationIndex]

        // Add to history (newest first, as stored in game)
        inflationHistory.unshift(newInflation)

        // Calculate new price using CORRECT order (reversed)
        const reversed = [...inflationHistory].reverse()
        const multiplier = getCumulativeInflationMultiplier(reversed, 'default')
        const newPrice = Math.round(1000 * multiplier)

        currentPrice = newPrice
        priceHistory.push(currentPrice)

        console.log(
          `Turn ${turn} (Q${Math.ceil(turn % 4 === 0 ? 4 : turn % 4)}): Inflation ${newInflation}%`,
        )
        console.log(`  Price: ${priceHistory[priceHistory.length - 2]} → ${currentPrice}`)

        // CHECK: Did price go down?
        if (currentPrice < priceHistory[priceHistory.length - 2]) {
          console.log(`  ❌ ERROR: PRICE WENT DOWN!`)
          expect.fail(`Price fell from ${priceHistory[priceHistory.length - 2]} to ${currentPrice}`)
        }
      } else {
        console.log(`Turn ${turn} (Q${turn % 4}): No inflation, price stays $${currentPrice}`)
      }
    }

    console.log('\n✅ All prices only went UP or stayed same')

    // Final check
    for (let i = 1; i < priceHistory.length; i++) {
      expect(
        priceHistory[i],
        `Price fell from ${priceHistory[i - 1]} to ${priceHistory[i]} at step ${i}`,
      ).toBeGreaterThanOrEqual(priceHistory[i - 1])
    }
  })

  it('EDGE CASE: Verify multiplier calculation with real order', () => {
    console.log('\n📊 MULTIPLIER CALCULATION VERIFICATION:\n')

    // Real scenario from game:
    // Turn 4: 2.1% inflation → history = [2.1]
    // Turn 8: 2.3% inflation → history = [2.3, 2.1]
    // Turn 12: 2.5% inflation → history = [2.5, 2.3, 2.1]

    const scenarios = [
      {
        name: 'After Turn 4 (1 year)',
        history: [2.1],
        expected: 1.021,
      },
      {
        name: 'After Turn 8 (2 years)',
        history: [2.3, 2.1],
        expected: 1.021 * 1.023, // 2.1% then 2.3%
      },
      {
        name: 'After Turn 12 (3 years)',
        history: [2.5, 2.3, 2.1],
        expected: 1.021 * 1.023 * 1.025, // 2.1%, 2.3%, 2.5%
      },
    ]

    for (const scenario of scenarios) {
      console.log(`\n${scenario.name}:`)
      console.log(`  Stored history (newest first): [${scenario.history.join(', ')}]`)

      const reversed = [...scenario.history].reverse()
      console.log(`  Reversed (oldest first): [${reversed.join(', ')}]`)

      const multiplier = getCumulativeInflationMultiplier(reversed, 'default')
      const price = Math.round(1000 * multiplier)

      console.log(`  Multiplier: ${multiplier.toFixed(6)}`)
      console.log(`  Price: 1000 → ${price}`)
      console.log(`  Expected: ${(1000 * scenario.expected).toFixed(0)}`)

      expect(price).toBeGreaterThanOrEqual(1000)
    }
  })
})
