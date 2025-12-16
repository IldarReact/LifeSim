import type { Notification } from './notification.types'

export interface MarketEvent {
  id: string
  title: string
  description: string
  effect?: {
    globalMarketModifier?: number
  }
  impact: number
  duration: number
  startTurn: number
  endTurn: number
  type: 'positive' | 'negative' | 'neutral'
}

export interface MarketResult {
  marketEvents: MarketEvent[]
  notifications: Notification[]
}
