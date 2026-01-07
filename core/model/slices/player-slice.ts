import type { StateCreator } from 'zustand'

import type { GameStore, PlayerSlice } from './types'

import { Player } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

export const createPlayerSlice: StateCreator<GameStore, [], [], PlayerSlice> = (set, get) => ({
  // State
  player: null,

  // Actions
  spendEnergy: (amount: number) => {
    const player = get().player
    if (!player) return

    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            stats: {
              ...state.player.stats,
              energy: Math.max(0, state.player.stats.energy - amount),
            },
            personal: {
              ...state.player.personal,
              stats: {
                ...state.player.personal.stats,
                energy: Math.max(0, state.player.personal.stats.energy - amount),
              },
            },
          }
        : null,
    }))
  },

  updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
    set((state) => {
      const prev = state.player
      if (!prev) return state

      const patch = typeof updater === 'function' ? updater(prev) : updater

      return {
        player: {
          ...prev,
          ...patch,
          stats: {
            ...prev.stats,
            ...(patch.personal?.stats ?? {}), // ✅ Sync: Сначала применяем статы из personal (если есть)
            ...(patch.stats ?? {}), // ✅ Sync: Затем явные статы (имеют приоритет)
          },
          personal: {
            ...prev.personal,
            ...(patch.personal ?? {}),
            stats: {
              ...prev.personal.stats,
              ...(patch.personal?.stats ?? {}),
            },
          },
        },
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
            energy: Math.min(100, Math.max(0, currentStats.energy + (changes.energy || 0))),
          },
          personal: {
            ...state.player.personal,
            stats: {
              ...currentStatEffect,
              money: (currentStatEffect.money || 0) + (changes.money || changes.cash || 0),
              happiness: Math.min(
                100,
                Math.max(0, currentStatEffect.happiness + (changes.happiness || 0)),
              ),
              health: Math.min(100, Math.max(0, currentStatEffect.health + (changes.health || 0))),
              energy: Math.min(100, Math.max(0, currentStatEffect.energy + (changes.energy || 0))),
              sanity: Math.min(100, Math.max(0, currentStatEffect.sanity + (changes.sanity || 0))),
              intelligence: Math.min(
                100,
                Math.max(0, currentStatEffect.intelligence + (changes.intelligence || 0)),
              ),
            },
          },
        },
      }
    })
  },

  performTransaction: (cost: StatEffect, options?: { requireFunds?: boolean; title?: string }) => {
    const state = get()
    if (!state.player) return false

    const deltaMoney = cost.money || 0
    const deltaEnergy = cost.energy || 0
    const requireFunds = options?.requireFunds ?? true
    const title = options?.title

    // 1. Check Money (only if spending)
    if (requireFunds && deltaMoney < 0 && state.player.stats.money < Math.abs(deltaMoney)) {
      state.pushNotification({
        type: 'error',
        title: title || 'Недостаточно средств',
        message: `Требуется $${Math.abs(deltaMoney).toLocaleString()}, у вас только $${state.player.stats.money.toLocaleString()}`,
      })
      return false
    }

    // 2. Check Energy (only if spending)
    if (deltaEnergy < 0 && state.player.stats.energy < Math.abs(deltaEnergy)) {
      state.pushNotification({
        type: 'info',
        title: 'Недостаточно энергии',
        message: 'Вы слишком устали для этого действия',
      })
      return false
    }

    // 3. Apply Changes
    get().applyStatChanges(cost)
    return true
  },
})
