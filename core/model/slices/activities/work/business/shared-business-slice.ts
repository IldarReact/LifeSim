import type { GameStateCreator } from '../../../types'

export const createSharedBusinessSlice: GameStateCreator<Record<string, unknown>> = (set, get) => ({
  addSharedBusiness: (business: any) => {
    const state = get()
    if (!state.player) return

    if (state.player.businesses.some((b) => b.id === business.id)) {
      const updatedBusinesses = state.player.businesses.map((b) =>
        b.id === business.id ? business : b,
      )
      set({ player: { ...state.player, businesses: updatedBusinesses } })
      return
    }

    set({ player: { ...state.player, businesses: [...state.player.businesses, business] } })
  },
})
