import type { StateCreator } from 'zustand'
import type { GameStore, PlayerSlice } from './types'

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
        personal: {
          ...state.player.personal,
          energy: Math.max(0, state.player.personal.energy - amount)
        },
        energy: Math.max(0, state.player.energy - amount)
      } : null
    }))
  },

  applyStatChanges: (changes: {
    happiness?: number
    health?: number
    energy?: number
    sanity?: number
    intelligence?: number
    cash?: number
  }) => {
    const player = get().player
    if (!player) return

    set((state) => ({
      player: state.player ? {
        ...state.player,
        cash: state.player.cash + (changes.cash || 0),
        personal: {
          ...state.player.personal,
          happiness: Math.min(100, Math.max(0, state.player.personal.happiness + (changes.happiness || 0))),
          health: Math.min(100, Math.max(0, state.player.personal.health + (changes.health || 0))),
          energy: Math.min(100, Math.max(0, state.player.personal.energy + (changes.energy || 0))),
          sanity: Math.min(100, Math.max(0, state.player.personal.sanity + (changes.sanity || 0))),
          intelligence: Math.min(100, Math.max(0, state.player.personal.intelligence + (changes.intelligence || 0)))
        },
        energy: Math.min(100, Math.max(0, state.player.energy + (changes.energy || 0)))
      } : null
    }))
  }
})
