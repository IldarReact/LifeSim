import type { GameStore } from '../../slices/types'
import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'
import { isQuarterEnd } from '@/core/lib/quarter'

export function commitTurn(ctx: TurnContext, state: TurnState): Partial<GameStore> {
  const nextTurn = ctx.turn + 1
  const nextYear = isQuarterEnd(ctx.turn) ? ctx.year + 1 : ctx.year

  const updatedPlayer = {
    ...state.player,

    // 💰 деньги
    stats: {
      ...state.player.stats,
      money: state.player.stats.money + state.financial.adjustedNetProfit,
    },

    // 🧠 персональные статы
    personal: {
      ...state.player.personal,
      stats: state.stats,
    },

    // 📊 отчёт
    quarterlyReport: state.financial.quarterlyReport,
  }

  return {
    // meta
    turn: nextTurn,
    year: nextYear,
    isProcessingTurn: false,

    // economy
    countries: state.countries,
    marketEvents: state.marketEvents,
    inflationNotification: state.inflationNotification,

    globalMarket: {
      value: state.globalMarketValue,
      description: `Фаза: ${state.country.cycle?.phase.toUpperCase()}`,
      trend: 'stable',
      lastUpdatedTurn: nextTurn,
    },

    // player
    player: updatedPlayer,

    // notifications
    notifications: state.notifications,
  }
}
