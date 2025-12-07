import type { EconomicEvent, CountryEconomy } from '@/core/types'
import { ECONOMIC_EVENT_DEFINITIONS } from './definitions'

export function applyEventEffects(economy: CountryEconomy, event: EconomicEvent): CountryEconomy {
  const { effects } = event
  return {
    ...economy,
    inflation: Math.max(0, economy.inflation + (effects.inflationChange || 0)),
    keyRate: Math.max(0, economy.keyRate + (effects.keyRateChange || 0)),
    gdpGrowth: economy.gdpGrowth + (effects.gdpGrowthChange || 0),
    unemployment: Math.max(
      0,
      Math.min(100, economy.unemployment + (effects.unemploymentChange || 0)),
    ),
    salaryModifier: economy.salaryModifier * (effects.salaryModifierChange || 1),
  }
}

export function updateActiveEvents(events: EconomicEvent[]): EconomicEvent[] {
  return events
    .map((event) => ({
      ...event,
      duration: event.duration - 1,
    }))
    .filter((event) => event.duration > 0)
}

export function applyNaturalEconomicChanges(economy: CountryEconomy): CountryEconomy {
  const targetInflation = 4
  const inflationDelta = (targetInflation - economy.inflation) * 0.1
  const keyRateDelta = (economy.inflation - targetInflation) * 0.2
  const gdpDelta = (Math.random() - 0.5) * 0.5

  return {
    ...economy,
    inflation: Math.max(0, economy.inflation + inflationDelta),
    keyRate: Math.max(0, economy.keyRate + keyRateDelta),
    gdpGrowth: economy.gdpGrowth + gdpDelta,
  }
}

export function calculateAdjustedSalary(
  baseSalary: number,
  economy: CountryEconomy,
  quartersPassed: number = 0,
): number {
  const quarterlyInflation = economy.inflation / 4 / 100
  const inflationMultiplier = Math.pow(1 + quarterlyInflation, quartersPassed)
  return Math.round(baseSalary * inflationMultiplier * economy.salaryModifier)
}
