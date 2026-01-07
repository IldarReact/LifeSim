import type { InflationNotification } from '@/core/lib/calculations/inflation-engine'
import type { GameState } from '@/core/types'

export interface GameSlice {
  turn: number
  year: number
  isProcessingTurn: boolean
  gameStatus: GameState['gameStatus']
  setupCountryId: string | null
  endReason: string | null
  activeActivity: string | null
  inflationNotification: InflationNotification | null

  // Actions
  setSetupCountry: (id: string) => void
  initializeGame: (countryId: string, archetype: string) => void
  resetGame: () => void
  setActiveActivity: (activity: string | null) => void
  nextTurn: () => void
  startSinglePlayer: () => void
  resolveCrisis: (actionType: string) => void
  clearInflationNotification: () => void
  closeYearReport: () => void
}
