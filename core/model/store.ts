import { create } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'
import type { GameStore } from './slices/types'
import { createGameSlice } from './slices/game-slice'
import { createPlayerSlice } from './slices/player-slice'
import { createEducationSlice } from './slices/education-slice'
import { createJobSlice } from './slices/job-slice'
import { createFreelanceSlice } from './slices/freelance-slice'
import { createFamilySlice } from './slices/family-slice'
import { createBusinessSlice } from './slices/business-slice'
import { createCoreBusinessSlice } from './slices/business/core-business-slice'
import { createEmployeesSlice } from './slices/business/employees-slice'
import { createRolesSlice } from './slices/business/roles-slice'
import { createPricingProductionSlice } from './slices/business/pricing-production-slice'
import { createPartnershipsSlice } from './slices/business/partnerships-slice'
import { createSharedBusinessSlice } from './slices/business/shared-business-slice'
import { createNotificationSlice } from './slices/notification-slice'
import { createMarketSlice } from './slices/market-slice'
import { createIdeaSlice } from './slices/idea-slice'
import { createShopSlice } from './slices/shop-slice'
import { WORLD_COUNTRIES } from '@/core/lib/data-loaders/economy-loader'
import { saveManager } from '@/core/lib/persistence/save-manager'
import type { GameState } from '@/core/schemas/game.schema'
import { createBankSlice } from './slices/bank-slice'
import { createGameOffersSlice } from './slices/game-offers-slice'

// Custom storage using saveManager for unified validation and checksum
const validatedStorage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    const state = await saveManager.load()
    if (!state) return null

    // Zustand expects a JSON string
    return JSON.stringify(state)
  },
  setItem: (name: string, value: string) => {
    try {
      const state = JSON.parse(value) as GameState
      saveManager.save(state)
    } catch (error) {
      console.error('❌ Failed to save via Zustand:', error)
    }
  },
  removeItem: (name: string) => {
    saveManager.clear()
  },
}))

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (...a) => ({
        // Shared state
        countries: WORLD_COUNTRIES,
        globalEvents: [],
        history: [],

        // Combine all slices
        ...createGameSlice(...a),
        ...createPlayerSlice(...a),
        ...createEducationSlice(...a),
        ...createJobSlice(...a),
        ...createFreelanceSlice(...a),
        ...createFamilySlice(...a),
        ...createBusinessSlice(...a),
        ...createCoreBusinessSlice(...a),
        ...createPricingProductionSlice(...a),
        ...createPartnershipsSlice(...a),
        ...createSharedBusinessSlice(...a),
        ...createEmployeesSlice(...a),
        ...createRolesSlice(...a),
        ...createNotificationSlice(...a),
        ...createMarketSlice(...a),
        ...createIdeaSlice(...a),
        ...createShopSlice(...a),
        ...createBankSlice(...a),
        ...createGameOffersSlice(...a),
      }),
      {
        name: 'lifesim-save-v1',
        version: 1,
        storage: validatedStorage,
        // Only persist when game is actually running
        partialize: (state) => {
          // Don't persist during menu, setup, or character selection
          if (
            state.gameStatus === 'menu' ||
            state.gameStatus === 'setup' ||
            state.gameStatus === 'select_country' ||
            state.gameStatus === 'select_character'
          ) {
            return {} // Don't persist incomplete state
          }
          return state // Persist everything else
        },
      },
    ),
    { name: 'LifeSim Game Store' },
  ),
)
