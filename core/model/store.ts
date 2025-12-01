import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameStore } from './slices/types'
import { createGameSlice } from './slices/game-slice'
import { createPlayerSlice } from './slices/player-slice'
import { createEducationSlice } from './slices/education-slice'
import { createJobSlice } from './slices/job-slice'
import { createFreelanceSlice } from './slices/freelance-slice'
import { createFamilySlice } from './slices/family-slice'
import { createBusinessSlice } from './slices/business-slice'
import { createNotificationSlice } from './slices/notification-slice'
import { createMarketSlice } from './slices/market-slice'
import { createIdeaSlice } from './slices/idea-slice'
import { createShopSlice } from './slices/shop-slice'
import { INITIAL_COUNTRIES } from '@/core/lib/initialState'

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      // Shared state
      countries: INITIAL_COUNTRIES,
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
      ...createNotificationSlice(...a),
      ...createMarketSlice(...a),
      ...createIdeaSlice(...a),
      ...createShopSlice(...a)
    }),
    {
      name: 'life-sim-storage',
      version: 1
    }
  )
)
