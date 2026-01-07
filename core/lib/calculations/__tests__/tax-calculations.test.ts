import { describe, it, expect } from 'vitest'

import { calculateQuarterlyTaxes } from '../calculate-quarterly-taxes'

import { CountryEconomy } from '@/core/types/economy.types'

describe('calculateQuarterlyTaxes', () => {
  const mockCountry: CountryEconomy = {
    id: 'test',
    name: 'Test Country',
    taxRate: 10, // 10%
    corporateTaxRate: 15,
    inflation: 0,
    stockMarketInflation: 0,
    keyRate: 0,
    interestRate: 0,
    unemployment: 0,
    salaryModifier: 1,
    costOfLivingModifier: 1,
    activeEvents: [],
    archetype: 'poor',
    gdpGrowth: 0,
  }

  it('calculates personal income tax correctly', () => {
    const result = calculateQuarterlyTaxes({
      income: 10000,
      assets: [],
      country: mockCountry,
    })

    expect(result.income).toBe(1000) // 10% of 10000
    expect(result.total).toBe(1000)
  })

  it('calculates property tax correctly', () => {
    const result = calculateQuarterlyTaxes({
      income: 0,
      assets: [{ id: '1', type: 'housing', value: 1000000, currentValue: 1000000 } as any],
      country: mockCountry,
    })

    // 0.125% per quarter = 1250
    expect(result.property).toBe(1250)
    expect(result.total).toBe(1250)
  })

  it('sanitizes NaN and undefined values', () => {
    const result = calculateQuarterlyTaxes({
      income: NaN,
      assets: [{ id: '1', type: 'housing', value: undefined } as any],
      country: { ...mockCountry, taxRate: undefined as any },
    })

    expect(result.income).toBe(0)
    expect(result.property).toBe(0)
    expect(result.total).toBe(0)
  })
})
