import type { TurnStep } from '../turn/turn-step'
import { processBuffs } from '../turns/buffs-processor'
import type { Stats } from '@/core/types'

export const buffsStep: TurnStep = (ctx, state) => {
  const res = processBuffs(state.buffs, {
    turn: ctx.turn,
    year: ctx.year,
  })

  // ⏳ обновляем баффы
  state.buffs = res.activeBuffs

  // 💰 деньги
  state.moneyDelta += res.moneyDelta

  // 📊 модификаторы статов
  for (const key in res.statModifiers) {
    const stat = key as keyof Stats
    state.statModifiers[stat] = (state.statModifiers[stat] ?? 0) + (res.statModifiers[stat] ?? 0)
  }

  // 🔔 уведомления
  state.notifications.push(...res.notifications)
}
