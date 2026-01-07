import type { GlobalMarketCondition, MarketEvent } from '@/core/types'

export interface MarketSlice {
  globalMarket: GlobalMarketCondition
  marketEvents: MarketEvent[]

  // Actions
  updateMarketCondition: (
    newValue: number,
    description: string,
    trend: 'rising' | 'falling' | 'stable',
  ) => void
  addMarketEvent: (event: MarketEvent) => void
}
