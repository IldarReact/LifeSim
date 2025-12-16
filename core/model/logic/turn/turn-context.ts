import { GameStore } from '../../slices'

export interface TurnContext {
  turn: number
  year: number
  prev: GameStore
}

export function createTurnContext(state: GameStore): TurnContext {
  return {
    turn: state.turn,
    year: state.year,
    prev: state,
  }
}