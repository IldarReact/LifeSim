import { isManagerialRole } from '@/core/lib/business/employee-roles.config'
import type { GameStateCreator } from '../../../types'

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

  assignPlayerRole: (businessId: string, role: EmployeeRole) => {
    const state = get()
    if (!state.player) return

    const isManagerial = isManagerialRole(role)

    const updatedBusinesses = state.player.businesses.map((b) => {
      if (b.id !== businessId) return b

      const playerRoles = { ...b.playerRoles }
      if (isManagerial) {
        if (!playerRoles.managerialRoles.includes(role)) {
          playerRoles.managerialRoles = [...playerRoles.managerialRoles, role]
        }
      } else {
        playerRoles.operationalRole = role
      }

      // Инициализируем трудоустройство игрока, чтобы можно было настраивать занятость
      const playerEmployment = b.playerEmployment || {
        role,
        salary: 0,
        effortPercent: 100,
        startedTurn: state.turn,
      }

      return { ...b, playerRoles, playerEmployment }
    })

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })
  },

  unassignPlayerRole: (businessId: string, role: EmployeeRole) => {
    const state = get()
    if (!state.player) return

    const updatedBusinesses = state.player.businesses.map((b) => {
      if (b.id !== businessId) return b

      const playerRoles = { ...b.playerRoles }
      let playerEmployment = b.playerEmployment

      if (playerRoles.managerialRoles.includes(role)) {
        playerRoles.managerialRoles = playerRoles.managerialRoles.filter((r) => r !== role)
      } else if (playerRoles.operationalRole === role) {
        playerRoles.operationalRole = null
      }

      // Если увольняемая роль совпадает с основной ролью трудоустройства, сбрасываем трудоустройство
      if (playerEmployment?.role === role) {
        playerEmployment = undefined
      }

      return { ...b, playerRoles, playerEmployment }
    })

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })
  },
})
