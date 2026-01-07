import type { GameStore } from '../../../../types'
import { BusinessChangeProposal } from '../partnership-business-slice.types'

import type { EmployeeRole } from '@/core/types/business.types'
import type {
  BusinessChangeApprovedEvent,
  BusinessChangeProposedEvent,
  BusinessChangeRejectedEvent,
  BusinessUpdatedEvent,
} from '@/core/types/events.types'

export const createPartnershipHandlers = (
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  get: () => GameStore,
) => ({
  onBusinessChangeProposed: (event: BusinessChangeProposedEvent) => {
    const state = get()
    if (!state.player) return

    const { businessId, proposalId, changeType, initiatorId, initiatorName, data } = event.payload

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    const proposal: BusinessChangeProposal = {
      id: proposalId,
      businessId,
      changeType,
      initiatorId,
      initiatorName,
      status: 'pending',
      createdAt: state.turn,
      data,
    }

    set((state) => ({
      businessProposals: [...state.businessProposals, proposal],
    }))

    state.pushNotification?.({
      type: 'info',
      title: 'Новое предложение',
      message: `${initiatorName} предлагает изменить параметры бизнеса ${business.name}`,
    })
  },

  onBusinessChangeApproved: (event: BusinessChangeApprovedEvent) => {
    const state = get()
    if (!state.player) return

    const { proposalId } = event.payload
    const proposal = state.businessProposals.find((p) => p.id === proposalId)

    set((state) => ({
      businessProposals: state.businessProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'approved' as const } : p,
      ),
    }))

    // Если это было предложение о вступлении в роль самого инициатора
    if (
      proposal &&
      (proposal.changeType === 'change_role' || proposal.changeType === 'hire_employee') &&
      proposal.data.isMe
    ) {
      console.log('[onBusinessChangeApproved] Player joining business as employee after approval')
      state.joinBusinessAsEmployee(
        proposal.businessId,
        proposal.data.employeeRole as EmployeeRole,
        proposal.data.employeeSalary || 0,
      )
    }

    state.pushNotification?.({
      type: 'success',
      title: 'Предложение одобрено',
      message: 'Ваше предложение по бизнесу было одобрено партнёром',
    })
  },

  onBusinessChangeRejected: (event: BusinessChangeRejectedEvent) => {
    const state = get()
    if (!state.player) return

    set((state) => ({
      businessProposals: state.businessProposals.map((p) =>
        p.id === event.payload.proposalId ? { ...p, status: 'rejected' as const } : p,
      ),
    }))

    state.pushNotification?.({
      type: 'warning',
      title: 'Предложение отклонено',
      message: 'Ваше предложение было отклонено партнёром',
    })
  },

  onBusinessUpdated: (event: BusinessUpdatedEvent) => {
    const state = get()
    if (!state.player) return

    const { businessId, changes } = event.payload

    set((state) => {
      if (!state.player) return state
      const player = state.player
      return {
        player: {
          ...player,
          businesses: player.businesses.map((business) => {
            if (business.id !== businessId) return business

            const processedChanges = { ...changes }
            let updatedPlayerEmployment = business.playerEmployment

            if (changes.employees && Array.isArray(changes.employees)) {
              const selfAsEmployee = changes.employees.find(
                (emp) => emp.id === `player_${player.id}`,
              )

              if (selfAsEmployee) {
                updatedPlayerEmployment = {
                  ...(updatedPlayerEmployment || {
                    startedTurn: state.turn,
                    experience: 0,
                  }),
                  role: selfAsEmployee.role,
                  salary: selfAsEmployee.salary,
                  effortPercent:
                    selfAsEmployee.effortPercent ?? updatedPlayerEmployment?.effortPercent ?? 100,
                }
              } else if (updatedPlayerEmployment) {
                updatedPlayerEmployment = undefined
              }

              processedChanges.employees = changes.employees.filter(
                (emp) => emp.id !== `player_${player.id}`,
              )
            }

            return {
              ...business,
              ...processedChanges,
              playerEmployment: updatedPlayerEmployment,
            }
          }),
        },
      }
    })
  },
})
