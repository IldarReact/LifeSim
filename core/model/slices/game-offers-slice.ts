import type { StateCreator } from 'zustand'
import type { GameStore, GameOffersSlice } from './types'
import type { GameOffer, OfferType, OfferDetails } from '@/core/types/game-offers.types'
import { generateOfferId, isJobOffer, isPartnershipOffer, isShareSaleOffer } from '@/core/types/game-offers.types'
import { broadcastEvent } from '@/core/lib/multiplayer'

export const createGameOffersSlice: StateCreator<GameStore, [], [], GameOffersSlice> = (set, get) => ({
  offers: [],

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
      expiresInTurns: 4 // Оффер действует 1 год (4 квартала)
    }

    set((state) => ({
      offers: [...state.offers, newOffer]
    }))

    // Отправляем событие всем игрокам
    broadcastEvent({
      type: 'OFFER_SENT',
      payload: { offer: newOffer }
    })

    console.log('[GameOffers] Offer sent:', newOffer)
  },

  acceptOffer: (offerId) => {
    const state = get()
    const offerIndex = state.offers.findIndex(o => o.id === offerId)

    if (offerIndex === -1) return

    const offer = state.offers[offerIndex]

    // Проверка: можно ли принять (статус pending)
    if (offer.status !== 'pending') return

    // Логика принятия в зависимости от типа
    // Логика принятия в зависимости от типа
    if (isJobOffer(offer)) {
      // 1. Устроиться на работу
      state.acceptExternalJob(
        offer.details.role,
        offer.details.businessName,
        offer.details.salary,
        offer.details.businessId
      )
    }
    else if (isPartnershipOffer(offer)) {
      // 2. Открыть бизнес с партнером
      if (state.player!.stats.money < offer.details.yourInvestment) {
        console.warn("Not enough money to accept partnership")
        return
      }

      // Списываем инвестиции
      state.applyStatChanges({ money: -offer.details.yourInvestment })

      console.log('[GameOffers] Accepting partnership:', offer.details)
    }
    else if (isShareSaleOffer(offer)) {
      // 3. Купить долю
      if (state.player!.stats.money < offer.details.price) {
        console.warn("Not enough money to buy share")
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
      payload: { offerId, acceptedBy: state.player!.id }
    })
  },

  rejectOffer: (offerId) => {
    const state = get()
    set((state) => ({
      offers: state.offers.map(o =>
        o.id === offerId ? { ...o, status: 'rejected' } : o
      )
    }))

    // Уведомляем отправителя
    broadcastEvent({
      type: 'OFFER_REJECTED',
      payload: { offerId, rejectedBy: state.player!.id }
    })
  },

  cancelOffer: (offerId) => {
    set((state) => ({
      offers: state.offers.map(o =>
        o.id === offerId ? { ...o, status: 'cancelled' } : o
      )
    }))
  },

  cleanupExpiredOffers: () => {
    const currentTurn = get().turn
    set((state) => ({
      offers: state.offers.map(o => {
        if (o.status === 'pending' && (currentTurn - o.createdTurn >= o.expiresInTurns)) {
          return { ...o, status: 'expired' }
        }
        return o
      })
    }))
  },

  getIncomingOffers: () => {
    const state = get()
    if (!state.player) return []
    return state.offers.filter(o => o.toPlayerId === state.player!.id)
  },

  getOutgoingOffers: () => {
    const state = get()
    if (!state.player) return []
    return state.offers.filter(o => o.fromPlayerId === state.player!.id)
  }
})
