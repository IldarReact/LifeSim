import type { GameStore } from '../../slices/types'
import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

import { initTurnState } from './init-turn-state'
import { commitTurn } from './commit-turn'
import { STEPS, TurnStep } from './turn-step'


type GetState = () => GameStore
type SetState = (partial: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => void

export function processTurn(get: GetState, set: SetState): void {
  const prev = get()
  if (!prev.player) return

  set({ isProcessingTurn: true })

  const ctx: TurnContext = { prev, turn: prev.turn, year: prev.year }
  const state: TurnState = initTurnState(ctx)

  for (const step of STEPS as TurnStep[]) {
    if (state.isAborted) break
    step(ctx, state)
  }

  const patch = commitTurn(ctx, state)

  set((s) => ({
    ...patch,
    // добавляем новые уведомления к старым
    notifications: [...(patch.notifications ?? []), ...s.notifications],
  }))
}
