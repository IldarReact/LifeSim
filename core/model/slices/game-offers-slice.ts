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
          yourInvestment: payload.yourInvestment,
          yourShare: payload.yourShare,
        },
        fromPlayerId: payload.partnerId,
        fromPlayerName: payload.partnerName,
      },
      state.turn,
      state.player.id,
      true, // Mark as initiator
    )

    // Link businesses
    initiatorBusiness.partnerBusinessId = payload.businessId

    // Deduct money from initiator
    state.applyStatChanges({ money: -payload.yourInvestment })

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

    // Notify the initiator
    state.pushNotification?.({
      type: 'success',
      title: 'Партнёрство создано',
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

  // In game-offers-slice.ts, update the acceptOffer method
  acceptOffer: (offerId) => {
    const state = get()
    const offerIndex = state.offers.findIndex((o) => o.id === offerId)

    if (offerIndex === -1) return

    const offer = state.offers[offerIndex]

    // Check if the offer is pending
    if (offer.status !== 'pending') return

    if (isPartnershipOffer(offer)) {
      // Check if player has enough money
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

      // Update offer status
      set((state) => ({
        offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'accepted' } : o)),
      }))

      // Notify the accepting player
      state.pushNotification?.({
        type: 'success',
        title: 'Партнёрство создано',
        message: `Вы стали партнером с ${offer.fromPlayerName} в бизнесе "${offer.details.businessName}"`,
      })
    }
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
