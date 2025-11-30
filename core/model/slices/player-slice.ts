import type { StateCreator } from 'zustand'
import type { GameStore, PlayerSlice } from './types'
import type { StatEffect } from '@/core/types/stats.types'
import { applyStats } from '@/core/helpers/applyStats'

export const createPlayerSlice: StateCreator<
  GameStore,
  [],
  [],
  PlayerSlice
> = (set, get) => ({
  // State
  player: null,

  // Actions
  spendEnergy: (amount: number) => {
    const player = get().player
    if (!player) return

    set((state) => ({
      player: state.player ? {
        ...state.player,
        stats: {
          ...state.player.stats,
          energy: Math.max(0, state.player.stats.energy - amount)
        },
        personal: {
          ...state.player.personal,
          stats: {
            ...state.player.personal.stats,
            energy: Math.max(0, state.player.personal.stats.energy - amount)
          }
        }
      } : null
    }))
  },

  applyStatChanges: (effect: StatEffect) => {
    const player = get().player
    if (!player) return

    const updatedStats = applyStats(player.stats, effect)
    const updatedPersonalStats = applyStats(player.personal.stats, effect)

    set((state) => ({
      player: state.player ? {
        ...state.player,
        stats: updatedStats,
        personal: {
          ...state.player.personal,
          stats: updatedPersonalStats
        }
      } : null
    }))
  }
})
