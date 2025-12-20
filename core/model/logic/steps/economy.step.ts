import { processEconomicCycle } from '../economy/cycle-processor'
import { generateGlobalEvents } from '@/core/lib/calculations/generate-global-events'
import type { TurnStep } from '../turn/turn-step'
import { formatGameDate } from '@/core/lib/quarter'

export const economyStep: TurnStep = (ctx, state) => {
  const country = state.country

  // 1. Цикл экономики страны
  const res = processEconomicCycle(country.cycle, ctx.turn)

  state.country = {
    ...country,
    cycle: res.cycle,
  }

  state.globalMarketValue = res.cycle.marketModifier

  if (res.newEvent) {
    state.country.activeEvents.push(res.newEvent)

    state.notifications.push({
      id: res.newEvent.id,
      type: res.newEvent.type === 'crisis' ? 'warning' : 'success',
      title: res.newEvent.title,
      message: res.newEvent.description,
      date: formatGameDate(ctx.year, ctx.turn),
      isRead: false,
    })
  }

  // 2. Глобальные события
  const oldEventsCount = state.globalEvents.length
  state.globalEvents = generateGlobalEvents(ctx.turn, state.globalEvents)

  // Если добавилось новое событие, отправляем уведомление
  if (state.globalEvents.length > oldEventsCount) {
    const newEvent = state.globalEvents[state.globalEvents.length - 1]
    state.notifications.push({
      id: `global_${newEvent.id}_${ctx.turn}`,
      type: 'info',
      title: `🌍 Глобальное событие: ${newEvent.title}`,
      message: newEvent.description,
      date: formatGameDate(ctx.year, ctx.turn),
      isRead: false,
    })
  }
}
