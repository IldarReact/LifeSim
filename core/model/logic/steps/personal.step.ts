import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'

export function personalStep(ctx: TurnContext, state: TurnState): void {
  try {
    const { processPersonal } = require('../turns/personal-processor')

    const res = processPersonal(state.player.personal, state.player.age, ctx.turn, ctx.year)

    state.player.personal = {
      ...state.player.personal,
      ...res,
    }

    state.notifications.push(...res.notifications)
  } catch {}
}
