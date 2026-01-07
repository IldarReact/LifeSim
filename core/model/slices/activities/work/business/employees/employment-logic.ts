import type { GameStore } from '../../../../types'

import { broadcastBusinessEmployeesUpdate } from '@/core/lib/multiplayer/broadcast-utils'
import type { Employee, Player, EmployeeRole } from '@/core/types'

export function handleJoinBusinessAsEmployee(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  role: EmployeeRole,
  salary: number,
  productivity: number = 100,
  effortPercent?: number,
) {
  const player = state.player as Player
  if (!player) return

  const business = player.businesses.find((b) => b.id === businessId)
  if (!business) return

  if (business.playerEmployment) return

  const isManagerial = (
    ['manager', 'accountant', 'marketer', 'lawyer', 'hr'] as EmployeeRole[]
  ).includes(role)
  const isOperational = (['salesperson', 'technician', 'worker'] as EmployeeRole[]).includes(role)
  const finalEffortPercent = effortPercent ?? (isManagerial ? 50 : 100)

  const updatedBusinesses = player.businesses.map((b) => {
    if (b.id !== businessId) return b

    const nextPlayerRoles = { ...b.playerRoles }
    if (isManagerial) {
      const setRoles = new Set(nextPlayerRoles.managerialRoles || [])
      setRoles.add(role)
      nextPlayerRoles.managerialRoles = Array.from(setRoles)
    } else if (isOperational) {
      nextPlayerRoles.operationalRole = role
    }

    return {
      ...b,
      playerRoles: nextPlayerRoles,
      playerEmployment: {
        role,
        salary,
        startedTurn: state.turn,
        experience: 0,
        effortPercent: finalEffortPercent,
        productivity,
      },
    }
  })

  set((state) => {
    if (!state.player) return state
    return {
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    }
  })

  const updatedBusiness = updatedBusinesses.find((b) => b.id === businessId)
  if (updatedBusiness) {
    broadcastBusinessEmployeesUpdate(updatedBusiness, player)
  }
}

export function handleLeaveBusinessJob(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
) {
  const player = state.player as Player
  if (!player) return

  const business = player.businesses.find((b) => b.id === businessId)
  if (!business || !business.playerEmployment) return

  const updatedBusinesses = player.businesses.map((b) => {
    if (b.id !== businessId) return b

    const nextPlayerRoles = { ...b.playerRoles }
    const roleToLeave = b.playerEmployment?.role

    if (roleToLeave) {
      const isManagerial = (
        ['manager', 'accountant', 'marketer', 'lawyer', 'hr'] as EmployeeRole[]
      ).includes(roleToLeave)
      if (isManagerial) {
        nextPlayerRoles.managerialRoles = (nextPlayerRoles.managerialRoles || []).filter(
          (r) => r !== roleToLeave,
        )
      } else {
        nextPlayerRoles.operationalRole = null
      }
    }

    return {
      ...b,
      playerRoles: nextPlayerRoles,
      playerEmployment: undefined,
    }
  })

  set((state) => {
    if (!state.player) return state
    return {
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    }
  })

  const updatedBusiness = updatedBusinesses.find((b) => b.id === businessId)
  if (updatedBusiness) {
    broadcastBusinessEmployeesUpdate(updatedBusiness, player)
  }
}

export function handleSetPlayerEmploymentEffort(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  effortPercent: number,
) {
  const player = state.player as Player
  if (!player) return

  const clamped = Math.max(10, Math.min(100, Math.round(effortPercent)))

  const updatedBusinesses = player.businesses.map((b) => {
    if (b.id !== businessId || !b.playerEmployment) return b
    const role = b.playerEmployment.role
    const isOperational = (['salesperson', 'technician', 'worker'] as EmployeeRole[]).includes(role)
    const newEffort = isOperational ? 100 : clamped
    return {
      ...b,
      playerEmployment: {
        ...b.playerEmployment,
        effortPercent: newEffort,
      },
    }
  })

  set((state) => {
    if (!state.player) return state
    return {
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    }
  })

  const updatedBusiness = updatedBusinesses.find((b) => b.id === businessId)
  if (updatedBusiness) {
    broadcastBusinessEmployeesUpdate(updatedBusiness, player)
  }
}

export function handleSetPlayerEmploymentSalary(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  salary: number,
) {
  const player = state.player as Player
  if (!player) return

  const clamped = Math.max(0, Math.round(salary))

  const updatedBusinesses = player.businesses.map((b) => {
    if (b.id !== businessId || !b.playerEmployment) return b
    return {
      ...b,
      playerEmployment: {
        ...b.playerEmployment,
        salary: clamped,
      },
    }
  })

  set((state) => {
    if (!state.player) return state
    return {
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    }
  })

  const updatedBusiness = updatedBusinesses.find((b) => b.id === businessId)
  if (updatedBusiness) {
    broadcastBusinessEmployeesUpdate(updatedBusiness, player)
  }
}

export function handleUpdateEmployeeInBusiness(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  employeeId: string,
  updates: Partial<Employee>,
) {
  const player = state.player as Player
  if (!player) return

  const i = player.businesses.findIndex((b) => b.id === businessId)
  if (i === -1) return

  const business = player.businesses[i]
  const existingIndex = business.employees.findIndex((e) => e.id === employeeId)

  if (existingIndex === -1) return

  const updatedEmployees = [...business.employees]
  updatedEmployees[existingIndex] = {
    ...updatedEmployees[existingIndex],
    ...updates,
  }

  const updatedBusinesses = [...player.businesses]
  updatedBusinesses[i] = {
    ...business,
    employees: updatedEmployees,
  }

  set((state) => {
    if (!state.player) return state
    return {
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    }
  })

  const updatedBusiness = updatedBusinesses[i]
  broadcastBusinessEmployeesUpdate(updatedBusiness, player)
}
