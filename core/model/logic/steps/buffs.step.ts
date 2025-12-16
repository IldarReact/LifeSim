import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'

export function buffsStep(ctx: TurnContext, state: TurnState): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../turns/buffs-processor') as typeof import('../turns/buffs-processor')

    const res = mod.processBuffs(state.activeBuffs, ctx.year, ctx.turn)

    state.activeBuffs = res.activeBuffs
    state.buffModifiers = res.modifiers
    state.notifications.push(...res.notifications)
  } catch {
    // fallback: оставляем как есть
  }
}
