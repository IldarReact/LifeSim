import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'
import { processMarket } from '../turns/market-processor'

export function shopStep(ctx: TurnContext, state: TurnState): void {
  const { prev } = ctx

  const res = processMarket(prev.marketEvents, ctx.turn, ctx.year)

  state.marketEvents = res.marketEvents
  state.notifications.push(...res.notifications)
}
