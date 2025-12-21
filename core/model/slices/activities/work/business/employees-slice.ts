import type { GameStateCreator } from '../../../types'

import { applyStats } from '@/core/helpers/apply-stats'
import { updateBusinessMetrics, validateEmployeeHire } from '@/core/lib/business'
import { broadcastEvent } from '@/core/lib/multiplayer'
import type { Employee, EmployeeCandidate } from '@/core/types'

export const createEmployeesSlice: GameStateCreator<Record<string, unknown>> = (set, get) => ({
  // Hire a new employee from candidate pool
  hireEmployee: (businessId: string, candidate: EmployeeCandidate) => {
    const state = get()
    if (!state.player) return

    const i = state.player.businesses.findIndex((b) => b.id === businessId)
    if (i === -1) return

    const business = state.player.businesses[i]

    // Validate hiring parameters
    const validation = validateEmployeeHire(
      business.walletBalance || 0,
      candidate.requestedSalary,
      business.employees.length,
      business.maxEmployees,
    )

    if (!validation.isValid) {
      console.warn(validation.error)
      return
    }

    const newEmployee: Employee = {
      id: `employee_${Date.now()}`,
      name: candidate.name,
      role: candidate.role,
      stars: candidate.stars,
      skills: candidate.skills,
      salary: candidate.requestedSalary,
      productivity: 75,
      experience: candidate.experience,
      humanTraits: candidate.humanTraits,
    }

    const employees = [...business.employees, newEmployee]

    const updatedBusiness = updateBusinessMetrics({
      ...business,
      employees,
    })

    const updatedBusinesses = [...state.player.businesses]
    updatedBusinesses[i] = updatedBusiness

    // Apply small energy cost for hiring action
    get().performTransaction?.({ energy: -10 })

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })
  },

  // Fire an employee by id
  fireEmployee: (businessId: string, employeeId: string) => {
    const state = get()
    if (!state.player) return

    const i = state.player.businesses.findIndex((b) => b.id === businessId)
    if (i === -1) return

    const business = state.player.businesses[i]

    const employees = business.employees.filter((e) => e.id !== employeeId)

    const updatedBusiness = updateBusinessMetrics({
      ...business,
      employees,
    })

    const updatedBusinesses = [...state.player.businesses]
    updatedBusinesses[i] = updatedBusiness

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })
  },

  // Hire a family member (lightweight placeholder)
  hireFamilyMember: (businessId: string, familyMemberId: string, role: string) => {
    console.log(
      `[Business] Hire family member ${familyMemberId} as ${role} in ${businessId} - placeholder`,
    )
  },

  // Add an employee (external or player) to business
  addEmployeeToBusiness: (
    businessId: string,
    employeeName: string,
    role: import('@/core/types').EmployeeRole,
    salary: number,
    playerId?: string,
  ) => {
    const state = get()
    if (!state.player) return

    const i = state.player.businesses.findIndex((b) => b.id === businessId)
    if (i === -1) return

    const business = state.player.businesses[i]

    const newEmployee: Employee = {
      id: playerId ? `player_${playerId}` : `emp_${Date.now()}`,
      name: employeeName,
      role: role as any,
      stars: 3,
      skills: {
        efficiency: 50,
      },
      salary: salary,
      productivity: 100,
      experience: 0,
      humanTraits: [],
    }

    const updatedBusiness = {
      ...business,
      employees: [...business.employees, newEmployee],
    }

    const updatedBusinesses = [...state.player.businesses]
    updatedBusinesses[i] = updatedBusiness

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })
  },

  // Player joins their business as an employee
  joinBusinessAsEmployee: (
    businessId: string,
    role: import('@/core/types').EmployeeRole,
    salary: number,
  ) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) {
      console.warn(`[Business] Business ${businessId} not found`)
      return
    }

    if (business.playerEmployment) {
      console.warn(`[Business] Player already employed in ${business.name}`)
      return
    }

    const updatedBusinesses = state.player.businesses.map((b) => {
      if (b.id !== businessId) return b
      const isManagerial = ['manager', 'accountant', 'marketer', 'lawyer', 'hr'].includes(
        role as any,
      )
      const isOperational = ['salesperson', 'technician', 'worker'].includes(role as any)

      const nextPlayerRoles = { ...b.playerRoles }
      if (isManagerial) {
        // Добавляем управленческую роль игроку
        const setRoles = new Set(nextPlayerRoles.managerialRoles || [])
        setRoles.add(role as any)
        nextPlayerRoles.managerialRoles = Array.from(setRoles) as any
      } else if (isOperational) {
        // Устанавливаем операционную роль игрока (полный день)
        nextPlayerRoles.operationalRole = role as any
      }

      return {
        ...b,
        playerRoles: nextPlayerRoles,
        playerEmployment: {
          role,
          salary,
          startedTurn: state.turn,
          experience: 0,
          effortPercent: isManagerial ? 50 : 100,
        },
      }
    })

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })

    console.log(
      `[Business] Player joined ${business.name} as ${role} with salary ${salary}/quarter`,
    )

    // Broadcast to partners
    if (business.partners && business.partners.length > 0) {
      business.partners.forEach((partner) => {
        if (partner.type === 'player') {
          broadcastEvent({
            type: 'BUSINESS_UPDATED',
            payload: {
              businessId,
              changes: {
                playerEmployment: {
                  role,
                  salary,
                  startedTurn: state.turn,
                },
              },
            },
            toPlayerId: partner.id,
          })
        }
      })
    }
  },

  // Player leaves their job in own business
  leaveBusinessJob: (businessId: string) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) {
      console.warn(`[Business] Business ${businessId} not found`)
      return
    }

    if (!business.playerEmployment) {
      console.warn(`[Business] Player not employed in ${business.name}`)
      return
    }

    const updatedBusinesses = state.player.businesses.map((b) =>
      b.id === businessId ? { ...b, playerEmployment: undefined } : b,
    )

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })

    console.log(`[Business] Player left ${business.name}`)

    // Broadcast to partners
    if (business.partners && business.partners.length > 0) {
      business.partners.forEach((partner) => {
        if (partner.type === 'player') {
          broadcastEvent({
            type: 'BUSINESS_UPDATED',
            payload: {
              businessId,
              changes: {
                playerEmployment: undefined,
              },
            },
            toPlayerId: partner.id,
          })
        }
      })
    }
  },

  // Set player's effort percent in their business job
  setPlayerEmploymentEffort: (businessId: string, effortPercent: number) => {
    const state = get()
    if (!state.player) return

    const clamped = Math.max(10, Math.min(100, Math.round(effortPercent)))

    const updatedBusinesses = state.player.businesses.map((b) => {
      if (b.id !== businessId || !b.playerEmployment) return b
      const role = b.playerEmployment.role as any
      const isOperational = ['salesperson', 'technician', 'worker'].includes(role)
      const newEffort = isOperational ? 100 : clamped
      return {
        ...b,
        playerEmployment: {
          ...b.playerEmployment,
          effortPercent: newEffort,
        },
      }
    })

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (business && business.partners && business.partners.length > 0) {
      business.partners.forEach((partner) => {
        if (partner.type === 'player') {
          broadcastEvent({
            type: 'BUSINESS_UPDATED',
            payload: {
              businessId,
              changes: {
                playerEmployment: updatedBusinesses.find((b) => b.id === businessId)
                  ?.playerEmployment,
              },
            },
            toPlayerId: partner.id,
          })
        }
      })
    }
  },

  // Set any employee's effort percent
  setEmployeeEffort: (businessId: string, employeeId: string, effortPercent: number) => {
    const state = get()
    if (!state.player) return

    const clamped = Math.max(10, Math.min(100, Math.round(effortPercent)))

    const updatedBusinesses = state.player.businesses.map((b) => {
      if (b.id !== businessId) return b
      return {
        ...b,
        employees: b.employees.map((emp) => {
          if (emp.id !== employeeId) return emp
          return {
            ...emp,
            effortPercent: clamped,
          }
        }),
      }
    })

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })

    // Broadcast change
    const business = updatedBusinesses.find((b) => b.id === businessId)
    if (business && business.partners && business.partners.length > 0) {
      business.partners.forEach((partner) => {
        if (partner.type === 'player') {
          broadcastEvent({
            type: 'BUSINESS_UPDATED',
            payload: {
              businessId,
              changes: {
                employees: business.employees,
              },
            },
            toPlayerId: partner.id,
          })
        }
      })
    }
  },
})
