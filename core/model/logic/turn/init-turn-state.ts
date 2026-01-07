import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

import { getCountry } from '@/core/lib/data-loaders/economy-loader'

export function initTurnState(ctx: TurnContext): TurnState {
  const prev = ctx.prev

  if (!prev.player) {
    throw new Error('initTurnState: player is missing in GameStore')
  }

  const player = structuredClone(prev.player)
  const country = prev.countries[player.countryId] ?? getCountry(player.countryId)

  if (!country) {
    throw new Error(`initTurnState: country ${player.countryId} not found`)
  }

  return {
    // meta
    turn: ctx.turn,
    year: ctx.year,
    gameStatus: prev.gameStatus || 'playing',
    isAborted: false,
    gameOverReason: null,

    // snapshot
    player,
    countries: prev.countries,
    country,
    globalEvents: prev.globalEvents ?? [],

    // market
    marketEvents: prev.marketEvents ?? [],
    globalMarketValue: 1,

    // buffs
    buffs: player.personal.buffs ?? [],
    statModifiers: {},
    moneyDelta: 0,

    // lifestyle
    lifestyle: {
      expenses: 0,
      breakdown: {
        food: 0,
        housing: 0,
        transport: 0,
        credits: 0,
        mortgage: 0,
        other: 0,
        total: 0,
      },
      modifiers: {},
    },

    // business
    business: {
      totalIncome: 0,
      totalExpenses: 0,
      totalTax: 0,
    },

    // working stats
    stats: structuredClone(player.personal.stats),

    // finance
    financial: {
      quarterlyReport: prev.player.quarterlyReport,
      netProfit: 0,
      adjustedNetProfit: 0,
    },

    // jobs / education
    pendingApplications: prev.pendingApplications ?? [],
    protectedSkills: new Set(),

    // economy
    inflationNotification: null,

    // history
    historyEntry: null,

    // system
    notifications: [],
  }
}
