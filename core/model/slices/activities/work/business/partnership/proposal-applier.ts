import type { GameStore } from '../../../../types'
import type { BusinessChangeProposal } from '../partnership-business-slice.types'

import { getPlayerShare } from '@/core/lib/business/partnership-permissions'
import type { EmployeeRole, EmployeeStars } from '@/core/types/business.types'

export function applyProposal(
  state: GameStore,
  proposal: BusinessChangeProposal,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
): Record<string, unknown> | null {
  const { businessId, changeType, data } = proposal
  const business = state.player?.businesses.find((b) => b.id === businessId)

  if (!business || !state.player) return {}

  let changesToBroadcast: Record<string, unknown> = {}

  switch (changeType) {
    case 'price':
      set((state) => {
        if (!state.player) return state
        return {
          player: {
            ...state.player,
            businesses: state.player.businesses.map((b) =>
              b.id === businessId ? { ...b, price: data.newPrice ?? b.price } : b,
            ),
          },
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
          ),
        }
      })
      changesToBroadcast = { price: data.newPrice }
      break

    case 'quantity':
      set((state) => {
        if (!state.player) return state
        return {
          player: {
            ...state.player,
            businesses: state.player.businesses.map((b) =>
              b.id === businessId ? { ...b, quantity: data.newQuantity ?? b.quantity } : b,
            ),
          },
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
          ),
        }
      })
      changesToBroadcast = { quantity: data.newQuantity }
      break

    case 'fund_collection': {
      const amount = data.collectionAmount || 0
      const playerShare = getPlayerShare(business, state.player.id)
      const contribution = Math.round(amount * (Math.max(0, Math.min(100, playerShare)) / 100))

      if (contribution > 0) {
        if (state.player.stats.money < contribution) {
          state.pushNotification?.({
            type: 'error',
            title: 'Недостаточно средств',
            message: 'У вас недостаточно денег для взноса',
          })
          return null
        }
        set((state) => {
          if (!state.player) return state
          const updatedPlayer = {
            ...state.player,
            stats: { ...state.player.stats, money: state.player.stats.money - contribution },
            personal: {
              ...state.player.personal,
              stats: {
                ...state.player.personal.stats,
                money: state.player.personal.stats.money - contribution,
              },
            },
            businesses: state.player.businesses.map((b) =>
              b.id === businessId
                ? { ...b, walletBalance: (b.walletBalance || 0) + contribution }
                : b,
            ),
          }
          return {
            player: updatedPlayer,
            businessProposals: state.businessProposals.map((p) =>
              p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
            ),
          }
        })
        const updatedBusiness = state.player.businesses.find((b) => b.id === businessId)
        changesToBroadcast = {
          walletBalance: (updatedBusiness?.walletBalance || 0) + contribution,
        }
      } else {
        set((state) => ({
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
          ),
        }))
      }
      break
    }

    case 'hire_employee':
      state.addEmployeeToBusiness(
        businessId,
        data.employeeName || 'Unknown',
        data.employeeRole as EmployeeRole,
        data.employeeSalary || 0,
        data.isMe ? proposal.initiatorId : undefined,
        {
          stars: (data.employeeStars as EmployeeStars) || 1,
          skills: data.skills,
          experience: data.experience,
          humanTraits: data.humanTraits,
        },
      )
      set((state) => ({
        businessProposals: state.businessProposals.map((p) =>
          p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
        ),
      }))
      break

    case 'change_role':
      if (data.isMe) {
        state.addEmployeeToBusiness(
          businessId,
          proposal.initiatorName || 'Unknown',
          data.employeeRole as EmployeeRole,
          data.employeeSalary || 0,
          proposal.initiatorId,
          {
            stars: (data.employeeStars as EmployeeStars) || 1,
            skills: data.skills,
            experience: data.experience,
            humanTraits: data.humanTraits,
          },
        )
      } else if (data.employeeId) {
        state.updateEmployeeInBusiness(businessId, data.employeeId, {
          role: data.employeeRole as EmployeeRole,
          salary: data.employeeSalary,
        })
      }
      set((state) => ({
        businessProposals: state.businessProposals.map((p) =>
          p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
        ),
      }))
      break

    case 'fire_employee':
      if (data.fireEmployeeId) {
        if (data.isMe) {
          state.leaveBusinessJob(businessId)
        } else {
          state.fireEmployee(businessId, data.fireEmployeeId)
        }
      }
      set((state) => ({
        businessProposals: state.businessProposals.map((p) =>
          p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
        ),
      }))
      break

    case 'promote_employee':
    case 'demote_employee':
      if (data.employeeId) {
        state.updateEmployeeInBusiness(businessId, data.employeeId, {
          salary: data.newSalary,
          stars: data.newStars as EmployeeStars,
        })
      }
      set((state) => ({
        businessProposals: state.businessProposals.map((p) =>
          p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
        ),
      }))
      break

    case 'freeze':
      state.freezeBusiness(businessId)
      set((state) => ({
        businessProposals: state.businessProposals.map((p) =>
          p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
        ),
      }))
      changesToBroadcast = { state: 'frozen' }
      break

    case 'unfreeze':
      state.unfreezeBusiness(businessId)
      set((state) => ({
        businessProposals: state.businessProposals.map((p) =>
          p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
        ),
      }))
      changesToBroadcast = { state: 'active' }
      break

    case 'open_branch':
      state.openBranch(businessId)
      set((state) => ({
        businessProposals: state.businessProposals.map((p) =>
          p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
        ),
      }))
      break

    case 'auto_purchase':
      if (data.autoPurchaseAmount !== undefined) {
        state.setAutoPurchase(businessId, data.autoPurchaseAmount)
      }
      set((state) => ({
        businessProposals: state.businessProposals.map((p) =>
          p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
        ),
      }))
      break
  }

  // After set call, we might need to get updated business for some broadcast changes
  if (Object.keys(changesToBroadcast).length === 0) {
    const updatedBusiness = state.player.businesses.find((b) => b.id === businessId)
    if (updatedBusiness) {
      if (['hire_employee', 'fire_employee', 'change_role'].includes(changeType)) {
        changesToBroadcast = { employees: updatedBusiness.employees }
      } else if (changeType === 'open_branch') {
        changesToBroadcast = {
          networkId: updatedBusiness.networkId,
          isMainBranch: updatedBusiness.isMainBranch,
        }
      }
    }
  }

  return changesToBroadcast
}
