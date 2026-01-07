import type { StateCreator } from 'zustand'

import type { GameStore, GameOffersSlice } from '../../../types'

import { handleAcceptJobOffer, handleOnJobOfferAccepted } from './offers/job-logic'
import { handleOnOfferSent, handleOnOfferRejected } from './offers/offer-handlers'
import { handleAcceptPartnership, handleOnPartnershipAccepted } from './offers/partnership-logic'

import { broadcastEvent } from '@/core/lib/multiplayer'
import {
  generateOfferId,
  isPartnershipOffer,
  isJobOffer,
  type GameOffer,
} from '@/core/types/game-offers.types'

export const createGameOffersSlice: StateCreator<GameStore, [], [], GameOffersSlice> = (
  set,
  get,
) => ({
  offers: [],

  onPartnershipAccepted: (event) => {
    handleOnPartnershipAccepted(get(), set, event.payload)
  },

  onPartnershipUpdated: (event) => {
    const state = get()
    if (!state.player) return

    const { businessId, partnerBusinessId } = event.payload

    set((state) => {
      if (!state.player) return state

      return {
        player: {
          ...state.player,
          businesses: state.player.businesses.map((business) =>
            business.id === businessId ? { ...business, partnerBusinessId } : business,
          ),
        },
      }
    })
  },

  onJobOfferAccepted: (event) => {
    handleOnJobOfferAccepted(get(), set, event.payload)
  },

  onOfferSent: (event) => {
    handleOnOfferSent(get(), set, event.payload)
  },

  onOfferRejected: (event) => {
    handleOnOfferRejected(get(), set, event.payload)
  },

  sendOffer: (type, toPlayerId, toPlayerName, details, message) => {
    const state = get()
    if (!state.player) return

    const newOffer = {
      id: generateOfferId(),
      type,
      fromPlayerId: state.player.id,
      fromPlayerName: state.player.name,
      toPlayerId,
      toPlayerName,
      details,
      message,
      status: 'pending' as const,
      createdTurn: state.turn,
      expiresInTurns: 1,
    } as GameOffer

    set((state) => ({
      offers: [...state.offers, newOffer],
    }))

    broadcastEvent({
      type: 'OFFER_SENT',
      payload: { offer: newOffer },
    })
  },

  acceptOffer: (offerId) => {
    const state = get()
    const offer = state.offers.find((o) => o.id === offerId)

    if (!offer || offer.status !== 'pending') return

    if (isPartnershipOffer(offer)) {
      handleAcceptPartnership(state, set, offer)
    } else if (isJobOffer(offer)) {
      handleAcceptJobOffer(state, set, offer)
    }
  },

  rejectOffer: (offerId) => {
    const state = get()
    set((state) => ({
      offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'rejected' } : o)),
    }))

    if (state.player) {
      broadcastEvent({
        type: 'OFFER_REJECTED',
        payload: { offerId, rejectedBy: state.player.id },
      })
    }
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
    const playerId = state.player.id
    return state.offers.filter((o) => o.toPlayerId === playerId)
  },

  getOutgoingOffers: () => {
    const state = get()
    if (!state.player) return []
    const playerId = state.player.id
    return state.offers.filter((o) => o.fromPlayerId === playerId)
  },
})
