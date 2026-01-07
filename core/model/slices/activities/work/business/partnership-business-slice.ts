import type { StateCreator } from 'zustand'

import type { GameStore } from '../../../types'

import { createPartnershipHandlers } from './partnership/partnership-handlers'
import { applyProposal } from './partnership/proposal-applier'
import { handleProposeBusinessChange } from './partnership/propose-logic'
import type { PartnershipBusinessSlice } from './partnership-business-slice.types'

import { getBusinessPartner } from '@/core/lib/business/partnership-permissions'
import { broadcastEvent } from '@/core/lib/multiplayer'


export const createPartnershipBusinessSlice: StateCreator<
  GameStore,
  [],
  [],
  PartnershipBusinessSlice
> = (set, get) => {
  const handlers = createPartnershipHandlers(set, get)

  return {
    businessProposals: [],

    proposeBusinessChange: (businessId, changeType, data) => {
      handleProposeBusinessChange(get(), set, businessId, changeType, data)
    },

    approveBusinessChange: (proposalId) => {
      const state = get()
      if (!state.player) return

      const proposal = state.businessProposals.find((p) => p.id === proposalId)
      if (!proposal) {
        console.error('[approveBusinessChange] Proposal not found:', proposalId)
        return
      }

      const business = state.player.businesses.find((b) => b.id === proposal.businessId)
      if (!business) {
        state.pushNotification?.({
          type: 'error',
          title: 'Ошибка',
          message: `Бизнес не найден (ID: ${proposal.businessId}). Это может быть старое предложение.`,
        })
        return
      }

      // Применяем изменения через хелпер
      const changesToBroadcast = applyProposal(state, proposal, set)

      if (changesToBroadcast === null) return // Ошибка (например, нет денег)

      // Отправляем событие инициатору об одобрении
      broadcastEvent({
        type: 'BUSINESS_CHANGE_APPROVED',
        payload: {
          businessId: proposal.businessId,
          proposalId,
          approverId: state.player.id,
        },
        toPlayerId: proposal.initiatorId,
      })

      // Отправляем обновление бизнеса инициатору
      broadcastEvent({
        type: 'BUSINESS_UPDATED',
        payload: {
          businessId: proposal.businessId,
          changes: changesToBroadcast,
        },
        toPlayerId: proposal.initiatorId,
      })

      state.pushNotification?.({
        type: 'success',
        title: 'Изменение одобрено',
        message: 'Изменения применены к бизнесу',
      })
    },

    rejectBusinessChange: (proposalId) => {
      const state = get()
      if (!state.player) return

      const proposal = state.businessProposals.find((p) => p.id === proposalId)
      if (!proposal) return

      set((state) => {
        if (!state.player) return state
        return {
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'rejected' as const } : p,
          ),
        }
      })

      broadcastEvent({
        type: 'BUSINESS_CHANGE_REJECTED',
        payload: {
          businessId: proposal.businessId,
          proposalId,
          rejecterId: state.player.id,
        },
        toPlayerId: proposal.initiatorId,
      })

      state.pushNotification?.({
        type: 'info',
        title: 'Изменение отклонено',
        message: 'Предложение было отклонено',
      })
    },

    updateBusinessDirectly: (businessId, changes) => {
      const state = get()
      if (!state.player) return

      const business = state.player.businesses.find((b) => b.id === businessId)
      if (!business) return

      set((state) => {
        if (!state.player) return state
        return {
          player: {
            ...state.player,
            businesses: state.player.businesses.map((b) =>
              b.id === businessId
                ? {
                    ...b,
                    price: changes.price ?? b.price,
                    quantity: changes.quantity ?? b.quantity,
                    state: changes.state ?? b.state,
                  }
                : b,
            ),
          },
        }
      })

      const partner = getBusinessPartner(business, state.player.id)
      if (partner) {
        broadcastEvent({
          type: 'BUSINESS_UPDATED',
          payload: {
            businessId,
            changes,
          },
          toPlayerId: partner.id,
        })
      }

      state.pushNotification?.({
        type: 'success',
        title: 'Бизнес обновлён',
        message: 'Изменения применены',
      })
    },

    ...handlers,
  }
}
