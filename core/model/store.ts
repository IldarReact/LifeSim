import { create } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'

import { createShopSlice } from './slices'
import { createBankSlice } from './slices/activities/bank/bank-slice'
import { createEducationSlice } from './slices/activities/education/education-slice'
import { createFamilySlice } from './slices/activities/family/family-slice'
import { createBusinessSlice } from './slices/activities/work/business/business-slice'
import { createCoreBusinessSlice } from './slices/activities/work/business/core-business-slice'
import { createEmployeesSlice } from './slices/activities/work/business/employees-slice'
import { createGameOffersSlice } from './slices/activities/work/business/game-offers-slice'
import { createPartnershipBusinessSlice } from './slices/activities/work/business/partnership-business-slice'
import { createPartnershipsSlice } from './slices/activities/work/business/partnerships-slice'
import { createPricingProductionSlice } from './slices/activities/work/business/pricing-production-slice'
import { createRolesSlice } from './slices/activities/work/business/roles-slice'
import { createSharedBusinessSlice } from './slices/activities/work/business/shared-business-slice'
import { createFreelanceSlice } from './slices/activities/work/freelance-slice'
import { createIdeaSlice } from './slices/activities/work/idea-slice'
import { createJobSlice } from './slices/activities/work/job-slice'
import { createGameSlice } from './slices/game-slice'
import { createMarketSlice } from './slices/market-slice'
import { createNotificationSlice } from './slices/notification-slice'
import { createPlayerSlice } from './slices/player-slice'
import type { GameStore } from './slices/types'

import { WORLD_COUNTRIES } from '@/core/lib/data-loaders/economy-loader'
import { saveManager } from '@/core/lib/persistence/save-manager'
import type { GameState } from '@/core/schemas/game.schema'

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
        ...createPartnershipBusinessSlice(...a),
      }),
      {
        name: 'artsurv-save-v1',
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
    { name: 'ArtSurv Game Store' },
  ),
)
