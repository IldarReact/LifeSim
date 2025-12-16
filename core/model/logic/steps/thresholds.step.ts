import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'
import { checkAllThresholdEffects, generateLowStatEvents } from '@/core/lib/threshold-effects'
import { formatGameDate } from '@/core/lib/quarter'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function thresholdsStep(ctx: TurnContext, state: TurnState): void {
  const baseStats = state.stats
  const lifestyle = state.lifestyle.modifiers
  const buffs = state.buffModifiers

  // 1️⃣ Применяем модификаторы
  const nextStats = {
    ...baseStats,
    health: clamp(baseStats.health + lifestyle.health + buffs.health, 0, 100),
    happiness: clamp(baseStats.happiness + lifestyle.happiness + buffs.happiness, 0, 100),
    sanity: clamp(baseStats.sanity + lifestyle.sanity + buffs.sanity, 0, 100),
    intelligence: clamp(
      baseStats.intelligence + lifestyle.intelligence + buffs.intelligence,
      0,
      100,
    ),
    energy: clamp(baseStats.energy + lifestyle.energy + buffs.energy, 0, 100),
  }

  state.stats = nextStats

  // 2️⃣ Threshold-эффекты (болезни, терапия и т.п.)
  const thresholdResult = checkAllThresholdEffects(nextStats)
  const lowStatEvents = generateLowStatEvents(nextStats, ctx.turn, ctx.year)

  // 3️⃣ Уведомления от threshold-эффектов
  thresholdResult.events.forEach((event) => {
    state.notifications.push({
      id: `threshold_${event.type}_${Date.now()}_${Math.random()}`,
      type: event.severity === 'critical' ? 'warning' : 'info',
      title: event.severity === 'critical' ? '⚠️ КРИТИЧЕСКОЕ СОСТОЯНИЕ' : '⚡ Предупреждение',
      message: event.message,
      date: formatGameDate(ctx.year, ctx.turn),
      isRead: false,
    })
  })

  // low-stat события
  state.notifications.push(...lowStatEvents)

  // 4️⃣ Финансовые последствия
  const thresholdCosts = thresholdResult.medicalCosts + thresholdResult.therapyCosts

  state.financial.adjustedNetProfit -= thresholdCosts
}
