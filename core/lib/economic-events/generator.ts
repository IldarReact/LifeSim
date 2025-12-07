import type { EconomicEvent, CountryEconomy } from '@/core/types'
import { ECONOMIC_EVENT_DEFINITIONS, createEconomicEvent } from './definitions'

function selectEventType(economy: CountryEconomy): keyof typeof ECONOMIC_EVENT_DEFINITIONS {
  const { inflation, gdpGrowth, unemployment } = economy

  if (inflation > 8) {
    return Math.random() > 0.3 ? 'rate_hike' : 'crisis'
  }

  if (gdpGrowth < 1) {
    return Math.random() > 0.5 ? 'recession' : 'rate_cut'
  }

  if (unemployment > 10) {
    return Math.random() > 0.5 ? 'crisis' : 'recession'
  }

  if (gdpGrowth > 4 && inflation < 5) {
    return 'boom'
  }

  const events = Object.keys(ECONOMIC_EVENT_DEFINITIONS) as Array<
    keyof typeof ECONOMIC_EVENT_DEFINITIONS
  >
  return events[Math.floor(Math.random() * events.length)]
}

export function generateEconomicEvent(
  turn: number,
  currentEconomy: CountryEconomy,
): EconomicEvent | null {
  if (Math.random() > 0.1) return null
  const type = selectEventType(currentEconomy)
  return createEconomicEvent(type as any, turn)
}
