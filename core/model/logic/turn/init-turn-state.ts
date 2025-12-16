import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'
import { getCountry } from '@/core/lib/data-loaders/economy-loader'

export function initTurnState(ctx: TurnContext): TurnState {
  if (!ctx.prev.player) {
    throw new Error('No player in TurnContext')
  }

  const player = structuredClone(ctx.prev.player)
  const country = ctx.prev.countries[player.countryId] ?? getCountry(player.countryId)

  return {
    turn: ctx.turn,
    year: ctx.year,

    player,

    pendingApplications: structuredClone(ctx.prev.pendingApplications),

    countries: structuredClone(ctx.prev.countries),
    country: structuredClone(country),
    marketEvents: [...ctx.prev.marketEvents],
    globalMarketValue: country.cycle?.marketModifier ?? 1,

    activeBuffs: [...(player.personal.buffs ?? [])],
    buffModifiers: {
      happiness: 0,
      health: 0,
      sanity: 0,
      intelligence: 0,
      energy: 0,
      income: 0,
    },

    business: {
      totalIncome: 0,
      totalExpenses: 0,
    },

    lifestyle: {
      expenses: 0,
      breakdown: {
        food: 0,
        housing: 0,
        transport: 0,
        credits: 0,
        mortgage: 0,
        other: 0,
      },
      modifiers: {
        happiness: 0,
        health: 0,
        sanity: 0,
        intelligence: 0,
        energy: 0,
      },
    },

    stats: structuredClone(player.personal.stats),

    financial: {
      quarterlyReport: null,
      netProfit: 0,
      adjustedNetProfit: 0,
    },

    notifications: [],
    protectedSkills: new Set(),

    inflationNotification: null,
  }
}
