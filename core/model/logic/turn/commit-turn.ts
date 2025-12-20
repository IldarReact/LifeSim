import type { GameStore } from '../../slices/types'
import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'
import { isQuarterEnd } from '@/core/lib/quarter'

export function commitTurn(ctx: TurnContext, state: TurnState): Partial<GameStore> {
  const nextTurn = ctx.turn + 1
  const nextYear = isQuarterEnd(ctx.turn) ? ctx.year + 1 : ctx.year

  return {
    // meta
    turn: nextTurn,
    year: nextYear,
    isProcessingTurn: false,
    gameStatus: state.gameStatus,
    endReason: state.gameOverReason as any,
    globalEvents: state.globalEvents,
    history: state.historyEntry ? [...ctx.prev.history, state.historyEntry] : ctx.prev.history,

    // player
    player: {
      ...state.player,

      stats: {
        ...state.player.stats,
        money: state.player.stats.money + state.financial.adjustedNetProfit,
      },

      personal: {
        ...state.player.personal,
        stats: state.stats,
      },
    },

    // economy
    countries: state.countries,
    marketEvents: state.marketEvents,

    globalMarket: {
      value: state.globalMarketValue,
      description: `Фаза: ${state.country.cycle?.phase ?? 'unknown'}`,
      trend: 'stable',
      lastUpdatedTurn: nextTurn,
    },

    // notifications
    notifications: state.notifications,

    // inflation
    inflationNotification: state.inflationNotification,
  }
}
