import type { StateCreator } from 'zustand'
import type { GameStore } from './types'
import type {
  PartnershipBusinessSlice,
  BusinessChangeProposal,
} from './partnership-business-slice.types'
import type {
  BusinessChangeProposedEvent,
  BusinessChangeApprovedEvent,
  BusinessChangeRejectedEvent,
  BusinessUpdatedEvent,
} from '@/core/types/events.types'
import type { BusinessChangeType } from '@/core/types/business.types'
import { broadcastEvent } from '@/core/lib/multiplayer'
import {
  canMakeDirectChanges,
  requiresApproval,
  canProposeChanges,
  getBusinessPartner,
  generateProposalId,
} from '@/core/lib/business/partnership-permissions'

export const createPartnershipBusinessSlice: StateCreator<
  GameStore,
  [],
  [],
  PartnershipBusinessSlice
> = (set, get) => ({
  businessProposals: [],

  proposeBusinessChange: (businessId, changeType, data) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) {
      console.error('Business not found:', businessId)
      return
    }

    // Проверяем права
    if (!canProposeChanges(business, state.player.id)) {
      state.pushNotification?.({
        type: 'error',
        title: 'Недостаточно прав',
        message: 'У вас недостаточно доли в бизнесе для внесения изменений (требуется минимум 50%)',
      })
      return
    }

    // Если можем вносить изменения напрямую
    if (canMakeDirectChanges(business, state.player.id)) {
      // Применяем изменения сразу
      state.updateBusinessDirectly(businessId, {
        price: data.newPrice,
        quantity: data.newQuantity,
      })
      return
    }

    // Если требуется согласование (50/50)
    if (requiresApproval(business, state.player.id)) {
      const proposalId = generateProposalId()
      const partner = getBusinessPartner(business, state.player.id)

      if (!partner) {
        console.error('Partner not found for business:', businessId)
        return
      }

      const proposal: BusinessChangeProposal = {
        id: proposalId,
        businessId,
        changeType,
        initiatorId: state.player.id,
        initiatorName: state.player.name,
        status: 'pending',
        createdAt: state.turn,
        data,
      }

      // Добавляем предложение локально
      set((state) => ({
        businessProposals: [...state.businessProposals, proposal],
      }))

      // Отправляем событие партнёру
      broadcastEvent({
        type: 'BUSINESS_CHANGE_PROPOSED',
        payload: {
          businessId,
          proposalId,
          changeType,
          initiatorId: state.player.id,
          initiatorName: state.player.name,
          data,
        },
        toPlayerId: partner.id,
      })

      state.pushNotification?.({
        type: 'info',
        title: 'Предложение отправлено',
        message: `Предложение об изменении отправлено партнёру ${partner.name}`,
      })
    }
  },

  approveBusinessChange: (proposalId) => {
    const state = get()
    if (!state.player) return

    const proposal = state.businessProposals.find((p) => p.id === proposalId)
    if (!proposal) {
      console.error('Proposal not found:', proposalId)
      return
    }

    // Обновляем статус предложения
    set((state) => ({
      businessProposals: state.businessProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'approved' as const } : p,
      ),
    }))

    // Применяем изменения к бизнесу
    const business = state.player.businesses.find((b) => b.id === proposal.businessId)
    if (business) {
      set((state) => ({
        player: {
          ...state.player!,
          businesses: state.player!.businesses.map((b) =>
            b.id === proposal.businessId
              ? {
                ...b,
                price: proposal.data.newPrice ?? b.price,
                quantity: proposal.data.newQuantity ?? b.quantity,
              }
              : b,
          ),
        },
      }))

      // Отправляем событие инициатору
      broadcastEvent({
        type: 'BUSINESS_CHANGE_APPROVED',
        payload: {
          businessId: proposal.businessId,
          proposalId,
          approverId: state.player.id,
        },
        toPlayerId: proposal.initiatorId,
      })

      // Отправляем обновление бизнеса
      broadcastEvent({
        type: 'BUSINESS_UPDATED',
        payload: {
          businessId: proposal.businessId,
          changes: {
            price: proposal.data.newPrice,
            quantity: proposal.data.newQuantity,
          },
        },
        toPlayerId: proposal.initiatorId,
      })
    }

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
    if (!proposal) {
      console.error('Proposal not found:', proposalId)
      return
    }

    // Обновляем статус предложения
    set((state) => ({
      businessProposals: state.businessProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'rejected' as const } : p,
      ),
    }))

    // Отправляем событие инициатору
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

    // Применяем изменения
    set((state) => ({
      player: {
        ...state.player!,
        businesses: state.player!.businesses.map((b) =>
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
    }))

    // Отправляем обновление партнёру
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

  // Event Handlers
  onBusinessChangeProposed: (event) => {
    const state = get()
    if (!state.player) return

    const proposal: BusinessChangeProposal = {
      id: event.payload.proposalId,
      businessId: event.payload.businessId,
      changeType: event.payload.changeType,
      initiatorId: event.payload.initiatorId,
      initiatorName: event.payload.initiatorName,
      status: 'pending',
      createdAt: state.turn,
      data: event.payload.data,
    }

    set((state) => ({
      businessProposals: [...state.businessProposals, proposal],
    }))

    state.pushNotification?.({
      type: 'info',
      title: 'Новое предложение',
      message: `${event.payload.initiatorName} предлагает изменить бизнес`,
    })
  },

  onBusinessChangeApproved: (event) => {
    const state = get()

    // Обновляем статус предложения
    set((state) => ({
      businessProposals: state.businessProposals.map((p) =>
        p.id === event.payload.proposalId ? { ...p, status: 'approved' as const } : p,
      ),
    }))

    state.pushNotification?.({
      type: 'success',
      title: 'Предложение одобрено',
      message: 'Ваше предложение было одобрено партнёром',
    })
  },

  onBusinessChangeRejected: (event) => {
    const state = get()

    // Обновляем статус предложения
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

  onBusinessUpdated: (event) => {
    const state = get()
    if (!state.player) return

    const { businessId, changes } = event.payload

    // Применяем изменения к бизнесу
    set((state) => ({
      player: {
        ...state.player!,
        businesses: state.player!.businesses.map((b) =>
          b.id === businessId
            ? {
              ...b,
              ...changes,
            }
            : b,
        ),
      },
    }))

    console.log('[PartnershipBusiness] Бизнес обновлён:', { businessId, changes })
  },
})
