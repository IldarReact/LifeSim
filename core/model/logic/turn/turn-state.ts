import type { PlayerState, Notification, JobApplication, MarketEvent } from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'
import type { InflationNotification } from '@/core/lib/calculations/inflation-engine'

export interface TurnState {
  turn: number
  year: number

  player: PlayerState

  countries: Record<string, CountryEconomy>
  country: CountryEconomy
  marketEvents: MarketEvent[]
  globalMarketValue: number

  activeBuffs: PlayerState['personal']['buffs']
  buffModifiers: {
    happiness: number
    health: number
    sanity: number
    intelligence: number
    energy: number
    income: number
  }

  business: {
    totalIncome: number
    totalExpenses: number
  }

  lifestyle: {
    expenses: number
    breakdown: {
      food: number
      housing: number
      transport: number
      credits: number
      mortgage: number
      other: number
    }
    modifiers: {
      happiness: number
      health: number
      sanity: number
      intelligence: number
      energy: number
    }
  }

  stats: PlayerState['personal']['stats']

  financial: {
    quarterlyReport: any
    netProfit: number
    adjustedNetProfit: number
  }

  notifications: Notification[]
  protectedSkills: Set<string>

  inflationNotification: InflationNotification | null
  pendingApplications: JobApplication[]
}

