import type { StateCreator } from 'zustand'
import type { GameStore, PlayerSlice } from './types'
import type { StatEffect } from '@/core/types/stats.types'

import { PlayerState } from '@/core/types'

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

  updatePlayer: (updater: Partial<PlayerState> | ((prev: PlayerState) => Partial<PlayerState>)) => {
    set(state => {
      const prev = state.player
      if (!prev) return state

      const patch = typeof updater === 'function' ? updater(prev) : updater

      return {
        player: {
          ...prev,
          ...patch,
          stats: {
            ...prev.stats,
            ...(patch.stats ?? {})
          },
          personal: {
            ...prev.personal,
            ...(patch.personal ?? {}),
            stats: {
              ...prev.personal.stats,
              ...(patch.personal?.stats ?? {})
            }
          }
        }
      }
    })
  },

  applyStatChanges: (changes: StatEffect & { cash?: number }) => {
    const player = get().player
    if (!player) return

    set((state) => {
      if (!state.player) return { player: null }

      const currentStats = state.player.stats
      const currentStatEffect = state.player.personal.stats

      return {
        player: {
          ...state.player,
          stats: {
            ...currentStats,
            money: currentStats.money + (changes.money || changes.cash || 0),
            energy: Math.min(100, Math.max(0, currentStats.energy + (changes.energy || 0)))
          },
          personal: {
            ...state.player.personal,
            stats: {
              ...currentStatEffect,
              happiness: Math.min(100, Math.max(0, currentStatEffect.happiness + (changes.happiness || 0))),
              health: Math.min(100, Math.max(0, currentStatEffect.health + (changes.health || 0))),
              energy: Math.min(100, Math.max(0, currentStatEffect.energy + (changes.energy || 0))),
              sanity: Math.min(100, Math.max(0, currentStatEffect.sanity + (changes.sanity || 0))),
              intelligence: Math.min(100, Math.max(0, currentStatEffect.intelligence + (changes.intelligence || 0)))
            }
          }
        }
      }
    })
  }
})
