import type { GameStateCreator } from '../../../types'
import type { Business } from '@/core/types/business.types'
import type { SharedBusinessSlice } from '../../../types/business.types'

export const createSharedBusinessSlice: GameStateCreator<SharedBusinessSlice> = (set, get) => ({
  addSharedBusiness: (business: Business) => {
    const state = get()
    if (!state.player) return

    if (state.player.businesses.some((b) => b.id === business.id)) {
      set((state) => {
        if (!state.player) return state
        const updatedBusinesses = state.player.businesses.map((b) =>
          b.id === business.id ? business : b,
        )
        return {
          player: { ...state.player, businesses: updatedBusinesses },
        }
      })
      return
    }

    set((state) => {
      if (!state.player) return state
      return {
        player: { ...state.player, businesses: [...state.player.businesses, business] },
      }
    })
  },
})
