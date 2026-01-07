import type { Player } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

export interface PlayerSlice {
  player: Player | null

  updatePlayer: (updater: (prev: Player) => Partial<Player>) => void

  // Actions
  applyStatChanges: (effect: StatEffect) => void
  performTransaction: (
    cost: StatEffect,
    options?: { requireFunds?: boolean; title?: string },
  ) => boolean
}
