import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'
import { processInflation } from '../turns/inflation-processor'
import { isQuarterEnd } from '@/core/lib/quarter'

export function inflationStep(ctx: TurnContext, state: TurnState): void {
  if (ctx.turn % 4 !== 0) return

  const res = require('../turns/inflation-processor').processInflation(
    state.countries,
    state.player.countryId,
    ctx.turn + 1,
    ctx.year + 1,
  )

  state.countries = res.updatedCountries
  state.inflationNotification = res.inflationNotification ?? null

  if (res.notification) {
    state.notifications.push(res.notification)
  }
}

