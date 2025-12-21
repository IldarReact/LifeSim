import type { StateCreator } from 'zustand'

import type { GameStore, GameOffersSlice } from '../../../types'

import { createPartnerBusiness } from '@/core/lib/business/create-partner-business'
import { broadcastEvent, getMyConnectionId } from '@/core/lib/multiplayer'
import type { BusinessType } from '@/core/types/business.types'
import {
  PartnershipAcceptedEvent,
  PartnershipUpdatedEvent,
  JobOfferAcceptedEvent,
} from '@/core/types/events.types'
import type { GameOffer } from '@/core/types/game-offers.types'
import { generateOfferId, isPartnershipOffer, isJobOffer } from '@/core/types/game-offers.types'

export const createGameOffersSlice: StateCreator<GameStore, [], [], GameOffersSlice> = (
  set,
  get,
) => ({
  offers: [],

  onPartnershipAccepted: (event: PartnershipAcceptedEvent) => {
    console.log('[DEBUG] onPartnershipAccepted called with:', event)
    const { payload } = event
    const state = get()
    console.log('[GameOffers] Обработка PARTNERSHIP_ACCEPTED:', {
      event,
      currentPlayerId: state.player?.id,
      payload,
    })
    if (!state.player) {
      console.error('No player in state')
      return
    }
    try {
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
            businessId: payload.businessId,
          },
          fromPlayerId: payload.partnerId,
          fromPlayerName: payload.partnerName,
        },
        state.turn,
        state.player.id,
        true,
      )

      // Связываем бизнесы
      initiatorBusiness.partnerBusinessId = payload.businessId

      // Вычитаем деньги у инициатора
      if (state.performTransaction) {
        state.performTransaction(
          { money: -payload.yourInvestment },
          { title: 'Партнёрская инвестиция' },
        )
      } else if (state.applyStatChanges) {
        state.applyStatChanges({ money: -payload.yourInvestment })
      }

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
      console.log('Отправка PARTNERSHIP_ACCEPTED', {
        toPlayerId: payload.partnerId, // Fixed: was offer.fromPlayerId which is not available here
        currentPlayerId: state.player?.id,
        // offer, // Fixed: offer is not available here
      })

      // Уведомляем инициатора
      state.pushNotification?.({
        type: 'success',
        title: 'Партнёрство создано',
        message: `Вы стали партнером с ${payload.partnerName} в бизнесе "${payload.businessName}"`,
      })
    } catch (error) {
      console.error('Error in onPartnershipAccepted:', error)
    }
  },

  onPartnershipUpdated: (event: PartnershipUpdatedEvent) => {
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

  onJobOfferAccepted: (event: JobOfferAcceptedEvent) => {
    const { payload } = event
    const state = get()
    if (!state.player) return

    console.log('[GameOffers] Обработка JOB_OFFER_ACCEPTED:', payload)

    // Добавляем игрока как сотрудника в бизнес работодателя
    state.addEmployeeToBusiness(
      payload.businessId,
      payload.employeeName,
      payload.role as any,
      payload.salary,
      payload.employeeId,
    )

    // Обновляем статус предложения локально
    set((state) => ({
      offers: state.offers.map((o) =>
        o.id === payload.offerId ? { ...o, status: 'accepted' } : o,
      ),
    }))

    // Уведомляем работодателя
    state.pushNotification?.({
      type: 'success',
      title: 'Сотрудник нанят',
      message: `${payload.employeeName} принял ваше предложение и устроился на должность ${payload.role}`,
    })
  },

  onOfferSent: (event: any) => {
    const { payload } = event
    const state = get()
    const myConnectionId = getMyConnectionId()
    const offer = payload.offer as GameOffer

    // Если оффер нам (сравниваем connectionId)
    if (offer.toPlayerId === myConnectionId) {
      console.log('[GameOffers] Received new offer for me:', offer.id)

      // Проверяем, нет ли уже такого оффера
      if (state.offers.some((o) => o.id === offer.id)) return

      set((state) => ({
        offers: [...state.offers, offer],
      }))

      // Показываем уведомление
      state.pushNotification?.({
        title: 'Новое предложение!',
        message: `От ${offer.fromPlayerName}`,
        type: 'info',
        data: {
          offerId: offer.id,
          type: 'offer_received',
        },
      })
    }
  },

  onOfferRejected: (event: any) => {
    const { payload } = event
    const state = get()
    const { offerId, rejectedBy } = payload

    // Обновляем статус оффера
    set((state) => ({
      offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'rejected' } : o)),
    }))

    // Если это наш оффер, уведомляем
    const offer = state.offers.find((o) => o.id === offerId)
    if (offer && offer.fromPlayerId === state.player?.id) {
      state.pushNotification?.({
        title: 'Предложение отклонено',
        message: `${offer.toPlayerName} отклонил ваше предложение`,
        type: 'info',
      })
    }
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
    console.log('Before broadcastEvent in sendOffer')
    broadcastEvent({
      type: 'OFFER_SENT',
      payload: { offer: newOffer },
    })
    console.log('After broadcastEvent in sendOffer')

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
    console.log('STEP 1: acceptOffer called', offerId)

    const offerIndex = state.offers.findIndex((o) => o.id === offerId)
    console.log('STEP 2: offerIndex', offerIndex)

    if (offerIndex === -1) {
      console.error('Предложение не найдено')
      return
    }

    const offer = state.offers[offerIndex]
    console.log('STEP 3: offer found', offer.type, offer.status)

    // Проверяем, что предложение ожидает ответа
    if (offer.status !== 'pending') {
      console.error('Предложение не ожидает ответа:', offer.status)
      return
    }

    console.log('STEP 4: checking type')
    if (isPartnershipOffer(offer)) {
      console.log('STEP 5: is partnership')
      // Проверяем, хватает ли у игрока денег
      if (state.player!.stats.money < offer.details.partnerInvestment) {
        console.warn('Недостаточно денег для принятия партнерства')
        return
      }
      console.log('Money check passed')

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
            businessId: offer.details.businessId,
          },
          fromPlayerId: offer.fromPlayerId,
          fromPlayerName: offer.fromPlayerName,
        },
        state.turn,
        state.player!.id,
        false, // isInitiator = false для принимающего игрока
      )
      console.log('STEP 6: business created', acceptingBusiness.id)

      // 2. Вычитаем деньги у принимающего игрока через централизованный метод
      if (state.performTransaction) {
        state.performTransaction(
          { money: -offer.details.partnerInvestment },
          { title: 'Партнёрская инвестиция' },
        )
      } else if (state.applyStatChanges) {
        state.applyStatChanges({ money: -offer.details.partnerInvestment })
      }

      console.log('[GameOffers] Обновление денег через performTransaction:', {
        oldMoney: state.player!.stats.money,
        investment: offer.details.partnerInvestment,
      })

      // 3. Добавляем бизнес принимающему игроку
      set((state) => ({
        player: {
          ...state.player!,
          businesses: [...state.player!.businesses, acceptingBusiness],
        },
      }))

      // 4. Уведомляем инициатора
      console.log('[GameOffers] Отправка PARTNERSHIP_ACCEPTED для инициатора:', {
        businessId: acceptingBusiness.id,
        partnerId: state.player!.id, // ID принимающего (получателя)
        partnerName: state.player!.name,
        toPlayerId: offer.fromPlayerId, // ID инициатора
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
          businessId_actual: acceptingBusiness.id, // For initiator to link
        },
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
    } else if (isJobOffer(offer)) {
      console.log('STEP 5: is job offer')
      // 1. Принимаем предложение работы
      state.joinBusinessAsEmployee(
        offer.details.businessId,
        offer.details.role,
        offer.details.salary,
      )

      // 2. Уведомляем работодателя (отправителя)
      broadcastEvent({
        type: 'JOB_OFFER_ACCEPTED',
        payload: {
          offerId: offer.id,
          employeeId: state.player!.id,
          employeeName: state.player!.name,
          businessId: offer.details.businessId,
          role: offer.details.role,
          salary: offer.details.salary,
        },
        toPlayerId: offer.fromPlayerId,
      })

      // 3. Обновляем статус предложения
      set((state) => ({
        offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'accepted' } : o)),
      }))

      // 4. Уведомляем игрока
      state.pushNotification?.({
        type: 'success',
        title: 'Работа принята',
        message: `Вы устроились в "${offer.details.businessName}" на должность ${offer.details.role}`,
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
