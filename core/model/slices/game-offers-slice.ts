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

export const createGameOffersSlice: StateCreator<GameStore, [], [], GameOffersSlice> = (set, get) => ({
  offers: [],

  onPartnershipAccepted: (event: GameEvent) => {
    const { payload } = event
    const state = get()

    console.log('[GameOffers] Обработка PARTNERSHIP_ACCEPTED:', {
      event,
      currentPlayerId: state.player?.id,
    })

    if (!state.player) return

    // Создаем бизнес для инициатора
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
      true, // Отмечаем как инициатора
    )

    // Связываем бизнесы
    initiatorBusiness.partnerBusinessId = payload.businessId

    // Вычитаем деньги у инициатора
    state.applyStatChanges({ money: -payload.yourInvestment })

    // Добавляем бизнес инициатору
    set((state) => ({
      player: {
        ...state.player!,
        businesses: [...state.player!.businesses, initiatorBusiness],
      },
    }))

    // Обновляем бизнес партнера с ссылкой
    broadcastEvent({
      type: 'PARTNERSHIP_UPDATED',
      payload: {
        businessId: payload.businessId,
        partnerBusinessId: initiatorBusiness.id,
      },
      toPlayerId: payload.partnerId,
    })

    // Уведомляем инициатора
    state.pushNotification?.({
      type: 'success',
      title: 'Партнёрство создано',
      message: `Вы стали партнером с ${payload.partnerName} в бизнесе "${payload.businessName}"`,
    })
  },

  onPartnershipUpdated: (event: GameEvent<{ businessId: string; partnerBusinessId: string }>) => {
    const state = get()
    if (!state.player) return

    console.log('[GameOffers] Обновление партнерства:', {
      businessId: event.payload.businessId,
      partnerBusinessId: event.payload.partnerBusinessId,
    })

    const { businessId, partnerBusinessId } = event.payload

    set((state) => ({
      player: {
        ...state.player!,
        businesses: state.player!.businesses.map((business) =>
          business.id === businessId ? { ...business, partnerBusinessId } : business,
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
      createdTurn: state.turn,
      expiresInTurns: 1,
    }

    set((state) => ({
      offers: [...state.offers, newOffer],
    }))

    // Отправляем событие всем игрокам
    broadcastEvent({
      type: 'OFFER_SENT',
      payload: { offer: newOffer },
    })

    console.log('[GameOffers] Отправка предложения:', {
      offerId: newOffer.id,
      type: newOffer.type,
      from: newOffer.fromPlayerId,
      to: newOffer.toPlayerId,
      details: newOffer.details,
    })
  },

  acceptOffer: (offerId) => {
    const state = get()
    const offerIndex = state.offers.findIndex((o) => o.id === offerId)

    console.log('[GameOffers] Принятие предложения:', {
      offerId,
      playerMoney: state.player?.stats.money,
      offer: state.offers.find((o) => o.id === offerId),
    })

    if (offerIndex === -1) {
      console.error('Предложение не найдено')
      return
    }

    const offer = state.offers[offerIndex]

    // Проверяем, что предложение ожидает ответа
    if (offer.status !== 'pending') {
      console.error('Предложение не ожидает ответа:', offer.status)
      return
    }

    if (isPartnershipOffer(offer)) {
      // Проверяем, хватает ли у игрока денег
      if (state.player!.stats.money < offer.details.partnerInvestment) {
        console.warn('Недостаточно денег для принятия партнерства')
        return
      }

      // 1. Создаем бизнес для принимающего игрока
      const acceptingBusiness = createPartnerBusiness(
        {
          details: {
            businessName: offer.details.businessName,
            businessType: offer.details.businessType as BusinessType,
            businessDescription: offer.details.businessDescription,
            totalCost: offer.details.totalCost,
            yourInvestment: offer.details.partnerInvestment,
            yourShare: offer.details.partnerShare,
          },
          fromPlayerId: offer.fromPlayerId,
          fromPlayerName: offer.fromPlayerName,
        },
        state.turn,
        state.player!.id,
        false, // isInitiator = false для принимающего игрока
      )

      // 2. Вычитаем деньги у принимающего игрока
      // Используем applyStatChanges для обновления состояния
      const newMoney = state.player!.stats.money - offer.details.partnerInvestment
      state.applyStatChanges({ money: -offer.details.partnerInvestment })

      console.log('[GameOffers] Обновление денег:', {
        oldMoney: state.player!.stats.money,
        investment: offer.details.partnerInvestment,
        newMoney,
      })

      // 3. Добавляем бизнес принимающему игроку
      set((state) => ({
        player: {
          ...state.player!,
          stats: {
            ...state.player!.stats,
            money: newMoney,
          },
          businesses: [...state.player!.businesses, acceptingBusiness],
        },
      }))

      // 4. Уведомляем инициатора
      console.log('[GameOffers] Отправка PARTNERSHIP_ACCEPTED для инициатора:', {
        businessId: acceptingBusiness.id,
        partnerId: state.player!.id,
        partnerName: state.player!.name,
      })

      broadcastEvent({
        type: 'PARTNERSHIP_ACCEPTED',
        payload: {
          businessId: acceptingBusiness.id,
          partnerId: state.player!.id,
          partnerName: state.player!.name,
          businessName: acceptingBusiness.name,
          businessType: acceptingBusiness.type,
          businessDescription: acceptingBusiness.description,
          totalCost: offer.details.totalCost,
          partnerShare: offer.details.partnerShare,
          partnerInvestment: offer.details.partnerInvestment,
          yourShare: offer.details.yourShare,
          yourInvestment: offer.details.yourInvestment,
        },
        toPlayerId: offer.fromPlayerId,
      })

      // 5. Обновляем статус предложения
      set((state) => ({
        offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'accepted' } : o)),
      }))

      // 6. Уведомляем принимающего игрока
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
