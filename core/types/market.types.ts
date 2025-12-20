/**
 * Глобальное состояние рынка
 * Влияет на спрос на все товары и услуги
 */
export interface GlobalMarketCondition {
  /**
   * Текущее состояние рынка (0.0 - 2.0)
   * 2.0 = мировой бум (все покупают, рост спроса)
   * 1.0 = нормальный рынок
   * 0.5 = кризис
   * 0.2 = мировой коллапс (почти ничего не покупают)
   */
  value: number

  /**
   * Описание текущего состояния
   */
  description: string

  /**
   * Тренд (растет/падает/стабильно)
   */
  trend: 'rising' | 'falling' | 'stable'

  /**
   * Когда последний раз обновлялось
   */
  lastUpdatedTurn: number
}

/**
 * Событие глобального рынка
 */
export interface MarketEvent {
  id: string
  title: string
  description: string
  impact: number // Изменение значения рынка (-1.0 до +1.0)
  duration: number
  turn: number
  type?: 'positive' | 'negative' | 'neutral'
  startTurn?: number
  endTurn?: number
  effect?: {
    globalMarketModifier?: number
  }
}

export interface MarketResult {
  marketEvents: MarketEvent[]
  notifications: Notification[]
}
