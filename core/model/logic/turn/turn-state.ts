import type { InflationNotification } from '@/core/lib/calculations/inflation-engine'
import type {
  PlayerState,
  Notification,
  JobApplication,
  MarketEvent,
  QuarterlyReport,
  Stats,
  TimedBuff,
  GameStatus,
  HistoryEntry,
} from '@/core/types'
import type { CountryEconomy, GlobalEvent } from '@/core/types/economy.types'

export interface TurnState {
  // meta
  turn: number
  year: number
  gameStatus: GameStatus
  isAborted: boolean
  gameOverReason: string | null

  // snapshot
  player: PlayerState
  countries: Record<string, CountryEconomy>
  country: CountryEconomy
  globalEvents: GlobalEvent[]

  // market
  marketEvents: MarketEvent[]
  globalMarketValue: number

  // buffs
  buffs: TimedBuff[]
  statModifiers: Partial<Stats> & { income?: number }
  moneyDelta: number

  // lifestyle
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
    modifiers: Partial<Stats>
  }

  // business (aggregated result of turn)
  business: {
    totalIncome: number
    totalExpenses: number
  }

  // working stats (before commit)
  stats: Stats

  // finance
  financial: {
    quarterlyReport: QuarterlyReport
    netProfit: number
    adjustedNetProfit: number
  }

  // jobs / education
  pendingApplications: JobApplication[]
  protectedSkills: Set<string>

  // economy
  inflationNotification: InflationNotification | null

  // history
  historyEntry: HistoryEntry | null

  // system
  notifications: Notification[]
}
