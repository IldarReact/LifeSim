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

    const playerRolesCount =
      (business.playerRoles.managerialRoles?.length || 0) +
      (business.playerRoles.operationalRole ? 1 : 0)

    // Validate hiring parameters
    const validation = validateEmployeeHire(
      business.walletBalance || 0,
      candidate.requestedSalary,
      business.employees.length + playerRolesCount,
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

    // Broadcast to partners
    if (updatedBusiness.partners && updatedBusiness.partners.length > 0) {
      updatedBusiness.partners.forEach((partner) => {
        if (partner.type === 'player') {
          // IMPORTANT: If we are employed in this business, we must include ourselves
          // in the employees list for the partner, otherwise they will remove us.
          let syncEmployees = [...updatedBusiness.employees]
          if (updatedBusiness.playerEmployment) {
            syncEmployees.push({
              id: `player_${state.player!.id}`,
              name: state.player!.name,
              role: updatedBusiness.playerEmployment.role,
              stars: 3,
              skills: { efficiency: 100 },
              salary: updatedBusiness.playerEmployment.salary,
              productivity: 100,
              experience: updatedBusiness.playerEmployment.experience || 0,
              humanTraits: [],
              effortPercent: updatedBusiness.playerEmployment.effortPercent || 100,
            } as any)
          }

          broadcastEvent({
            type: 'BUSINESS_UPDATED',
            payload: {
              businessId,
              changes: {
                employees: syncEmployees,
              },
            },
            toPlayerId: partner.id,
          })
        }
      })
    }
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

    // Broadcast to partners
    if (updatedBusiness.partners && updatedBusiness.partners.length > 0) {
      updatedBusiness.partners.forEach((partner) => {
        if (partner.type === 'player') {
          // IMPORTANT: If we are employed in this business, we must include ourselves
          // in the employees list for the partner, otherwise they will remove us.
          let syncEmployees = [...updatedBusiness.employees]
          if (updatedBusiness.playerEmployment) {
            syncEmployees.push({
              id: `player_${state.player!.id}`,
              name: state.player!.name,
              role: updatedBusiness.playerEmployment.role,
              stars: 3,
              skills: { efficiency: 100 },
              salary: updatedBusiness.playerEmployment.salary,
              productivity: 100,
              experience: updatedBusiness.playerEmployment.experience || 0,
              humanTraits: [],
              effortPercent: updatedBusiness.playerEmployment.effortPercent || 100,
            } as any)
          }

          broadcastEvent({
            type: 'BUSINESS_UPDATED',
            payload: {
              businessId,
              changes: {
                employees: syncEmployees,
              },
            },
            toPlayerId: partner.id,
          })
        }
      })
    }
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

    const employeeId = playerId ? `player_${playerId}` : `emp_${Date.now()}`
    const newEmployee: Employee = {
      id: employeeId,
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

    // Replace if exists, otherwise append
    const existingIndex = business.employees.findIndex((e) => e.id === employeeId)
    let newEmployees = [...business.employees]
    if (existingIndex !== -1) {
      newEmployees[existingIndex] = newEmployee
    } else {
      newEmployees.push(newEmployee)
    }

    const updatedBusiness = {
      ...business,
      employees: newEmployees,
    }

    const updatedBusinesses = [...state.player.businesses]
    updatedBusinesses[i] = updatedBusiness

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses,
      },
    })

    // Broadcast to partners
    if (updatedBusiness.partners && updatedBusiness.partners.length > 0) {
      updatedBusiness.partners.forEach((partner) => {
        if (partner.type === 'player') {
          // IMPORTANT: If we are adding an employee (possibly another player or ourselves),
          // we must include the player-as-employee in the list for the partner if applicable.
          let syncEmployees = [...updatedBusiness.employees]
          if (updatedBusiness.playerEmployment) {
            syncEmployees.push({
              id: `player_${state.player!.id}`,
              name: state.player!.name,
              role: updatedBusiness.playerEmployment.role,
              stars: 3,
              skills: { efficiency: 100 },
              salary: updatedBusiness.playerEmployment.salary,
              productivity: 100,
              experience: updatedBusiness.playerEmployment.experience || 0,
              humanTraits: [],
              effortPercent: updatedBusiness.playerEmployment.effortPercent || 100,
            } as any)
          }

          broadcastEvent({
            type: 'BUSINESS_UPDATED',
            payload: {
              businessId,
              changes: {
                employees: syncEmployees,
              },
            },
            toPlayerId: partner.id,
          })
        }
      })
    }
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

    const isManagerial = ['manager', 'accountant', 'marketer', 'lawyer', 'hr'].includes(role as any)
    const isOperational = ['salesperson', 'technician', 'worker'].includes(role as any)

    const updatedBusinesses = state.player.businesses.map((b) => {
      if (b.id !== businessId) return b

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
          const updatedBusiness = get().player?.businesses.find((b) => b.id === businessId)
          if (updatedBusiness) {
            // IMPORTANT: For the partner, the current player is an employee.
            // We must include ourselves in the employees list we send to them,
            // otherwise we will be removed from their local state.
            const playerAsEmployee = {
              id: `player_${state.player!.id}`,
              name: state.player!.name,
              role: role,
              stars: 3, // Default for player
              skills: { efficiency: 100 },
              salary: salary,
              productivity: 100,
              experience: 0,
              humanTraits: [],
              effortPercent: isManagerial ? 50 : 100,
            }

            broadcastEvent({
              type: 'BUSINESS_UPDATED',
              payload: {
                businessId,
                changes: {
                  employees: [...updatedBusiness.employees, playerAsEmployee],
                },
              },
              toPlayerId: partner.id,
            })
          }
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
          // When we leave the job, we broadcast the updated employees list (without us)
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

    const business = updatedBusinesses.find((b) => b.id === businessId)
    if (business && business.partners && business.partners.length > 0) {
      business.partners.forEach((partner) => {
        if (partner.type === 'player') {
          // IMPORTANT: When we change our own effort, we must broadcast it to the partner
          // as an update to the employees list, where we are represented as a player employee.
          let syncEmployees = [...business.employees]
          if (business.playerEmployment) {
            syncEmployees.push({
              id: `player_${state.player!.id}`,
              name: state.player!.name,
              role: business.playerEmployment.role,
              stars: 3,
              skills: { efficiency: 100 },
              salary: business.playerEmployment.salary,
              productivity: 100,
              experience: business.playerEmployment.experience || 0,
              humanTraits: [],
              effortPercent: business.playerEmployment.effortPercent || 100,
            } as any)
          }

          broadcastEvent({
            type: 'BUSINESS_UPDATED',
            payload: {
              businessId,
              changes: {
                employees: syncEmployees,
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
          // IMPORTANT: If we are employed in this business, we must include ourselves
          // in the employees list for the partner, otherwise they will remove us.
          let syncEmployees = [...business.employees]
          if (business.playerEmployment) {
            syncEmployees.push({
              id: `player_${state.player!.id}`,
              name: state.player!.name,
              role: business.playerEmployment.role,
              stars: 3,
              skills: { efficiency: 100 },
              salary: business.playerEmployment.salary,
              productivity: 100,
              experience: business.playerEmployment.experience || 0,
              humanTraits: [],
              effortPercent: business.playerEmployment.effortPercent || 100,
            } as any)
          }

          broadcastEvent({
            type: 'BUSINESS_UPDATED',
            payload: {
              businessId,
              changes: {
                employees: syncEmployees,
              },
            },
            toPlayerId: partner.id,
          })
        }
      })
    }
  },
})
