import type { StateCreator } from 'zustand'
import type { GameStore, MarketSlice } from './types'
import type { GlobalMarketCondition, MarketEvent } from '@/core/types'

/**
 * Market Slice - управление глобальным рынком
 */
export const createMarketSlice: StateCreator<
  GameStore,
  [],
  [],
  MarketSlice
> = (set, get) => ({
  // Начальное состояние рынка - нормальное
  globalMarket: {
    value: 1.0,
    description: 'Стабильный рынок',
    trend: 'stable',
    lastUpdatedTurn: 0
  },

  marketEvents: [],

  /**
   * Обновить состояние глобального рынка
   */
  updateMarketCondition: (newValue, description, trend) => {
    const state = get()

    // Ограничиваем значение в диапазоне 0.1 - 2.0
    const clampedValue = Math.max(0.1, Math.min(2.0, newValue))

    console.log(`[MARKET] Обновление рынка: ${state.globalMarket.value.toFixed(2)} → ${clampedValue.toFixed(2)}`)
    console.log(`[MARKET] Описание: ${description}`)
    console.log(`[MARKET] Тренд: ${trend}`)

    set({
      globalMarket: {
        value: clampedValue,
        description,
        trend,
        lastUpdatedTurn: state.turn
      }
    })
  },

  /**
   * Добавить событие рынка
   */
  addMarketEvent: (event) => {
    const state = get()

    console.log(`[MARKET EVENT] ${event.title}`)
    console.log(`[MARKET EVENT] Влияние: ${event.impact > 0 ? '+' : ''}${event.impact.toFixed(2)}`)
    console.log(`[MARKET EVENT] Длительность: ${event.duration} кварталов`)

    // Применяем влияние события к текущему значению рынка
    const newValue = state.globalMarket.value + event.impact
    const trend: 'rising' | 'falling' | 'stable' =
      event.impact > 0.1 ? 'rising' :
        event.impact < -0.1 ? 'falling' :
          'stable'

    set({
      marketEvents: [...state.marketEvents, event],
      globalMarket: {
        value: Math.max(0.1, Math.min(2.0, newValue)),
        description: event.description,
        trend,
        lastUpdatedTurn: state.turn
      }
    })
  }
})
