import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'
import { formatGameDate } from '@/core/lib/quarter'
import type { CountryEconomy } from '@/core/types/economy.types'

type CycleProcessorResult =
  | {
      cycle: NonNullable<CountryEconomy['cycle']>
      newEvent: CountryEconomy['activeEvents'][number] | null
    }
  | {
      cycle: {
        phase: 'growth'
        durationLeft: number
        intensity: number
        marketModifier: number
      }
      newEvent: null
    }

export function economyStep(ctx: TurnContext, state: TurnState): void {
  const player = state.player
  const countryId = player.countryId

  let country = state.country

  let cycleResult
  try {
    const { processEconomicCycle } = require('../economy/cycle-processor')
    cycleResult = processEconomicCycle(country.cycle, ctx.turn)
  } catch {
    cycleResult = {
      cycle: { phase: 'growth', durationLeft: 10, intensity: 0.5, marketModifier: 1 },
      newEvent: null,
    }
  }

  country = { ...country, cycle: cycleResult.cycle }

  if (cycleResult.newEvent) {
    country = {
      ...country,
      activeEvents: [...country.activeEvents, cycleResult.newEvent],
    }

    state.notifications.push({
      id: cycleResult.newEvent.id,
      type: cycleResult.newEvent.type === 'crisis' ? 'warning' : 'success',
      title: cycleResult.newEvent.title,
      message: cycleResult.newEvent.description,
      date: `${state.year} Q${state.turn}`,
      isRead: false,
    })
  }

  state.country = country
  state.globalMarketValue = country.cycle?.marketModifier ?? 1
  state.countries = {
    ...state.countries,
    [countryId]: country,
  }
}
