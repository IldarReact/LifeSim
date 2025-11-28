import type { StateCreator } from 'zustand'
import type { GameStore, GameSlice } from './types'
import { INITIAL_COUNTRIES, createInitialPlayer } from '@/core/lib/initialState'
import { processTurn } from '../logic/turn-logic'

export const createGameSlice: StateCreator<
  GameStore,
  [],
  [],
  GameSlice
> = (set, get) => ({
  // State
  turn: 0,
  year: 2024,
  isProcessingTurn: false,
  gameStatus: 'menu',
  setupCountryId: null,
  endReason: null,
  activeActivity: null,

  // Actions
  setSetupCountry: (id: string) => {
    set({ setupCountryId: id, gameStatus: 'select_character' })
  },

  startSinglePlayer: () => {
    set({ gameStatus: 'setup' })
  },

  initializeGame: (countryId, archetype) => {
    const cId = countryId || get().setupCountryId
    if (!cId) return

    set({
      turn: 1,
      year: 2024,
      gameStatus: 'playing',
      countries: INITIAL_COUNTRIES,
      player: createInitialPlayer(archetype, cId),
      history: [],
      notifications: [],
      pendingApplications: [],
      pendingFreelanceApplications: []
    })
  },

  resetGame: () => {
    set({
      turn: 0,
      year: 2024,
      isProcessingTurn: false,
      globalEvents: [],
      countries: INITIAL_COUNTRIES,
      player: null,
      history: [],
      gameStatus: 'menu',
      activeActivity: null,
      pendingEventNotification: null,
      setupCountryId: null,
      notifications: [],
      pendingApplications: [],
      pendingFreelanceApplications: []
    })
  },

  setActiveActivity: (activity: string | null) => {
    set({ activeActivity: activity })
  },

  nextTurn: () => {
    processTurn(get, set)
  }
})
