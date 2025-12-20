import type { TurnStep } from '../turn/turn-step'
import { checkAllThresholdEffects, generateLowStatEvents } from '@/core/lib/threshold-effects'
import { checkDefeatConditions } from '@/core/lib/defeat-conditions'
import { formatGameDate } from '@/core/lib/quarter'

const clamp = (v: number) => Math.max(0, Math.min(100, v))

export const thresholdsStep: TurnStep = (ctx, state) => {
  const s = state.stats
  const l = state.lifestyle.modifiers
  const m = state.statModifiers

  // 1. Применяем накопленные модификаторы к статам
  // Энергия восстанавливается до 100 и затем применяются модификаторы (затраты и бонусы)
  state.stats = {
    ...s,
    health: clamp(s.health + (l.health || 0) + (m.health || 0)),
    happiness: clamp(s.happiness + (l.happiness || 0) + (m.happiness || 0)),
    sanity: clamp(s.sanity + (l.sanity || 0) + (m.sanity || 0)),
    intelligence: clamp(s.intelligence + (l.intelligence || 0) + (m.intelligence || 0)),
    energy: clamp(100 + (l.energy || 0) + (m.energy || 0)),
  }

  // 2. Проверяем пороги (медицинские расходы и т.д.)
  const res = checkAllThresholdEffects(state.stats)
  const low = generateLowStatEvents(state.stats, ctx.turn, ctx.year)

  res.events.forEach((event) => {
    state.notifications.push({
      id: `threshold_${event.type}_${Date.now()}_${Math.random()}`,
      type: event.severity === 'critical' ? 'warning' : 'info',
      title: event.severity === 'critical' ? '⚠️ КРИТИЧЕСКОЕ СОСТОЯНИЕ' : '⚡ Предупреждение',
      message: event.message,
      date: formatGameDate(ctx.year, ctx.turn),
      isRead: false,
    })
  })

  state.financial.adjustedNetProfit -= (res.medicalCosts + res.therapyCosts)
  state.notifications.push(...low)

  // 3. Проверка условий поражения
  const gameOverReason = checkDefeatConditions(state.stats)
  if (gameOverReason) {
    state.gameStatus = 'ended'
    state.gameOverReason = gameOverReason
    state.isAborted = true
  }
}
