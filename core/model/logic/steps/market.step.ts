import type { TurnStep } from '../turn/turn-step'
import { processMarket } from '../turns/market-processor'

export const marketStep: TurnStep = (ctx, state) => {
  const res = processMarket(state.marketEvents, ctx.turn, ctx.year)

  state.marketEvents = res.marketEvents
  state.notifications.push(...res.notifications)
}
