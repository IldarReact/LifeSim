import type { TurnStep } from '../turn/turn-step'
import type { HistoryEntry } from '@/core/types'

export const historyStep: TurnStep = (ctx, state) => {
  const totalAssetValue = state.player.assets.reduce((acc, a) => acc + a.currentValue, 0)

  const entry: HistoryEntry = {
    turn: ctx.turn,
    year: ctx.year,
    netWorth: state.stats.money + totalAssetValue,
    happiness: state.stats.happiness,
    health: state.stats.health,
  }

  state.historyEntry = entry
}
