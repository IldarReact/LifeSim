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

    // Создаем бизнес для инициатора партнерства
    const business = createPartnerBusiness(
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
    )

    // Связываем бизнесы
    business.partnerBusinessId = payload.businessId

    // Списываем инвестиции у инициатора
    state.applyStatChanges({ money: -payload.yourInvestment })

    // Добавляем бизнес инициатору
    set((state) => ({
      player: {
        ...state.player!,
        businesses: [...state.player!.businesses, business],
      },
    }))

    // Обновляем партнерские ссылки
    broadcastEvent({
      type: 'PARTNERSHIP_UPDATED',
      payload: {
        businessId: payload.businessId,
        partnerBusinessId: business.id,
      },
      toPlayerId: payload.partnerId,
    })

    // Уведомляем игрока
    state.pushNotification({
      type: 'success',
      title: 'Партнерство создано',
      message: `Вы стали партнером с ${payload.partnerName} в бизнесе "${payload.businessName}"`,
    })
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

      // Создаем бизнес для текущего игрока (партнера)
      const business = createPartnerBusiness(
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

      // Списываем инвестиции у принимающего игрока
      state.applyStatChanges({ money: -offer.details.yourInvestment })

      // Добавляем бизнес принимающему игроку
      set((state) => ({
        player: {
          ...state.player!,
          businesses: [...state.player!.businesses, business],
        },
      }))

      console.log('[GameOffers] Принято партнёрство:', offer.details)

      // Уведомляем отправителя о принятии оффера
      broadcastEvent({
        type: 'PARTNERSHIP_ACCEPTED',
        payload: {
          businessId: business.id,
          partnerId: state.player!.id,
          partnerName: state.player!.name,
          partnerBusinessId: business.partnerBusinessId!,
          businessName: business.name,
          businessType: business.type,
          businessDescription: business.description,
          totalCost: business.initialCost,
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
