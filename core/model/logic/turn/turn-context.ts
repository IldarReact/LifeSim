import type { GameStore } from '../../slices/types'

export interface TurnContext {
  readonly prev: GameStore
  readonly turn: number
  readonly year: number
}
