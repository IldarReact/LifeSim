import type { GameStateCreator } from '../types'
import type { EmployeeRole } from '@/core/types/business.types'

export const createRolesSlice: GameStateCreator<Record<string, unknown>> = (set, get) => ({
  setPlayerManagerialRoles: (businessId: string, roles: EmployeeRole[]) => {
    const state = get()
    if (!state.player) return

    const updatedBusinesses = state.player.businesses.map((b) =>
      b.id === businessId ? { ...b, playerRoles: { ...b.playerRoles, managerialRoles: roles } } : b,
    )

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })
  },

  setPlayerOperationalRole: (businessId: string, role: EmployeeRole | null) => {
    const state = get()
    if (!state.player) return

    const updatedBusinesses = state.player.businesses.map((b) =>
      b.id === businessId ? { ...b, playerRoles: { ...b.playerRoles, operationalRole: role } } : b,
    )

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })
  },
})
