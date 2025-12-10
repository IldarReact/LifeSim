import type { StateCreator } from 'zustand'
import type { GameStore, GameOffersSlice } from './types'
import type { GameOffer, OfferType, OfferDetails } from '@/core/types/game-offers.types'
import type { Business, BusinessType } from '@/core/types/business.types'
import {
  generateOfferId,
  isJobOffer,
  isPartnershipOffer,
  isShareSaleOffer,
} from '@/core/types/game-offers.types'
import { broadcastEvent } from '@/core/lib/multiplayer'
import { createPartnerBusiness } from '@/core/lib/business/create-partner-business'
import { GameEvent } from '@/core/types/events.types'

export const createGameOffersSlice: StateCreator<GameStore, [], [], GameOffersSlice> = (
  set,
  get,
) => ({
  offers: [],

  onPartnershipAccepted: (event: GameEvent) => {
    const { payload } = event
    const state = get()

    if (!state.player) return

    // Create business for the initiator
    const initiatorBusiness = createPartnerBusiness(
      {
        details: {
          businessName: payload.businessName,
          businessType: payload.businessType,
          businessDescription: payload.businessDescription,
          totalCost: payload.totalCost,
          yourInvestment: payload.partnerInvestment,
          yourShare: payload.partnerShare,
        },
        fromPlayerId: payload.partnerId,
        fromPlayerName: payload.partnerName,
      },
      state.turn,
      state.player.id,
      true,
    )

    // Link businesses
    initiatorBusiness.partnerBusinessId = payload.businessId

    // Deduct money from initiator
    state.applyStatChanges({ money: -payload.partnerInvestment })

    // Add business to initiator
    set((state) => ({
      player: {
        ...state.player!,
        businesses: [...state.player!.businesses, initiatorBusiness],
      },
    }))

    // Update partner's business with the link
    broadcastEvent({
      type: 'PARTNERSHIP_UPDATED',
      payload: {
        businessId: payload.businessId,
        partnerBusinessId: initiatorBusiness.id,
      },
      toPlayerId: payload.partnerId,
    })

    // Notify the player
    state.pushNotification?.({
      type: 'success',
      title: 'Партнерство создано',
      message: `Вы стали партнером с ${payload.partnerName} в бизнесе "${payload.businessName}"`,
    })
  },

  onPartnershipUpdated: (event: GameEvent<{ businessId: string; partnerBusinessId: string }>) => {
    const { payload } = event
    const state = get()

    if (!state.player) return

    // Update the business with partner's business ID
    set((state) => ({
      player: {
        ...state.player!,
        businesses: state.player!.businesses.map((b) =>
          b.id === payload.businessId ? { ...b, partnerBusinessId: payload.partnerBusinessId } : b,
        ),
      },
    }))
  },

  sendOffer: (type, toPlayerId, toPlayerName, details, message) => {
    const state = get()
    if (!state.player) return

    const newOffer: GameOffer = {
      id: generateOfferId(),
      type,
      fromPlayerId: state.player.id,
      fromPlayerName: state.player.name,
      toPlayerId,
      toPlayerName,
      details,
      message,
      status: 'pending',
      createdTurn: state.turn, // Fixed: currentTurn -> turn
      expiresInTurns: 1, // Оффер действует 1 год (4 квартала)
    }

    set((state) => ({
      offers: [...state.offers, newOffer],
    }))

    // Отправляем событие всем игрокам
    broadcastEvent({
      type: 'OFFER_SENT',
      payload: { offer: newOffer },
    })

    console.log('[GameOffers] Offer sent:', newOffer)
  },

  acceptOffer: (offerId) => {
    const state = get()
    const offerIndex = state.offers.findIndex((o) => o.id === offerId)

    if (offerIndex === -1) return

    const offer = state.offers[offerIndex]

    // Проверка: можно ли принять (статус pending)
    if (offer.status !== 'pending') return

    // Логика принятия в зависимости от типа
    if (isJobOffer(offer)) {
      // 1. Устроиться на работу
      state.acceptExternalJob(
        offer.details.role,
        offer.details.businessName,
        offer.details.salary,
        offer.details.businessId,
      )
    } else if (isPartnershipOffer(offer)) {
      if (state.player!.stats.money < offer.details.yourInvestment) {
        console.warn('Not enough money to accept partnership')
        return
      }

      // Create business for the accepting player
      const acceptingBusiness = createPartnerBusiness(
        {
          details: {
            businessName: offer.details.businessName,
            businessType: offer.details.businessType as BusinessType,
            businessDescription: offer.details.businessDescription,
            totalCost: offer.details.totalCost,
            yourInvestment: offer.details.yourInvestment,
            yourShare: offer.details.yourShare,
          },
          fromPlayerId: offer.fromPlayerId,
          fromPlayerName: offer.fromPlayerName,
        },
        state.turn,
        state.player!.id,
      )

      // Deduct money from accepting player
      state.applyStatChanges({ money: -offer.details.yourInvestment })

      // Add business to accepting player
      set((state) => ({
        player: {
          ...state.player!,
          businesses: [...state.player!.businesses, acceptingBusiness],
        },
      }))

      console.log('[GameOffers] Принято партнёрство:', offer.details)

      // Notify the initiator
      broadcastEvent({
        type: 'PARTNERSHIP_ACCEPTED',
        payload: {
          businessId: acceptingBusiness.id,
          partnerId: state.player!.id,
          partnerName: state.player!.name,
          partnerBusinessId: acceptingBusiness.partnerBusinessId!,
          businessName: acceptingBusiness.name,
          businessType: acceptingBusiness.type,
          businessDescription: acceptingBusiness.description,
          totalCost: acceptingBusiness.initialCost,
          partnerShare: 100 - offer.details.yourShare,
          partnerInvestment: offer.details.yourInvestment,
          yourShare: offer.details.yourShare,
          yourInvestment: offer.details.yourInvestment,
        },
        toPlayerId: offer.fromPlayerId,
      })
    } else if (isShareSaleOffer(offer)) {
      // 3. Купить долю
      if (state.player!.stats.money < offer.details.price) {
        console.warn('Not enough money to buy share')
        return
      }

      // Списываем стоимость доли
      state.applyStatChanges({ money: -offer.details.price })

      console.log('[GameOffers] Accepting share sale:', offer.details)
    }

    // Обновляем статус
    set((state) => {
      const newOffers = [...state.offers]
      newOffers[offerIndex] = { ...newOffers[offerIndex], status: 'accepted' }
      return { offers: newOffers }
    })

    // Уведомляем отправителя
    broadcastEvent({
      type: 'OFFER_ACCEPTED',
      payload: { offerId, acceptedBy: state.player!.id },
    })
  },

  rejectOffer: (offerId) => {
    const state = get()
    set((state) => ({
      offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'rejected' } : o)),
    }))

    // Уведомляем отправителя
    broadcastEvent({
      type: 'OFFER_REJECTED',
      payload: { offerId, rejectedBy: state.player!.id },
    })
  },

  cancelOffer: (offerId) => {
    set((state) => ({
      offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'cancelled' } : o)),
    }))
  },

  cleanupExpiredOffers: () => {
    const currentTurn = get().turn
    set((state) => ({
      offers: state.offers.map((o) => {
        if (o.status === 'pending' && currentTurn - o.createdTurn >= o.expiresInTurns) {
          return { ...o, status: 'expired' }
        }
        return o
      }),
    }))
  },

  getIncomingOffers: () => {
    const state = get()
    if (!state.player) return []
    return state.offers.filter((o) => o.toPlayerId === state.player!.id)
  },

  getOutgoingOffers: () => {
    const state = get()
    if (!state.player) return []
    return state.offers.filter((o) => o.fromPlayerId === state.player!.id)
  },
})
