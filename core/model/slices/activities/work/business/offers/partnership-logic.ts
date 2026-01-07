import type { GameStore } from '../../../../types'

import { createPartnerBusiness } from '@/core/lib/business/create-partner-business'
import { broadcastEvent } from '@/core/lib/multiplayer'
import type { PartnershipOffer } from '@/core/types'
import type { BusinessType } from '@/core/types/business.types'

export interface PartnershipAcceptedPayload {
  businessId: string
  partnerId: string
  partnerName: string
  businessName: string
  businessType: BusinessType
  businessDescription: string
  totalCost: number
  partnerShare: number
  partnerInvestment: number
  yourShare: number
  yourInvestment: number
  businessId_actual?: string
  employeeRoles: import('@/core/types/business.types').BusinessRoleTemplate[]
}

export function handleAcceptPartnership(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  offer: PartnershipOffer,
) {
  if (!state.player) return

  // Проверяем, хватает ли у игрока денег
  if (state.player.stats.money < offer.details.partnerInvestment) {
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
        businessId: offer.details.businessId,
        employeeRoles: offer.details.employeeRoles,
      },
      fromPlayerId: offer.fromPlayerId,
      fromPlayerName: offer.fromPlayerName,
    },
    state.turn,
    state.player.id,
    false, // isInitiator = false для принимающего игрока
  )

  // 2. Вычитаем деньги у принимающего игрока
  if (state.performTransaction) {
    state.performTransaction(
      { money: -offer.details.partnerInvestment },
      { title: 'Партнёрская инвестиция' },
    )
  } else if (state.applyStatChanges) {
    state.applyStatChanges({ money: -offer.details.partnerInvestment })
  }

  // 3. Добавляем бизнес принимающему игроку
  set((state) => {
    if (!state.player) return state
    return {
      player: {
        ...state.player,
        businesses: [...state.player.businesses, acceptingBusiness],
      },
      offers: state.offers.map((o) => (o.id === offer.id ? { ...o, status: 'accepted' } : o)),
    }
  })

  // 4. Уведомляем инициатора
  const payload: PartnershipAcceptedPayload = {
    businessId: acceptingBusiness.id,
    partnerId: state.player.id,
    partnerName: state.player.name,
    businessName: acceptingBusiness.name,
    businessType: acceptingBusiness.type,
    businessDescription: acceptingBusiness.description,
    totalCost: offer.details.totalCost,
    partnerShare: offer.details.partnerShare,
    partnerInvestment: offer.details.partnerInvestment,
    yourShare: offer.details.yourShare,
    yourInvestment: offer.details.yourInvestment,
    businessId_actual: acceptingBusiness.id,
    employeeRoles: offer.details.employeeRoles,
  }

  broadcastEvent({
    type: 'PARTNERSHIP_ACCEPTED',
    payload,
  })

  // 5. Уведомляем принимающего игрока
  state.pushNotification?.({
    type: 'success',
    title: 'Партнёрство создано',
    message: `Вы стали партнером с ${offer.fromPlayerName} в бизнесе "${offer.details.businessName}"`,
  })
}

export function handleOnPartnershipAccepted(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  payload: PartnershipAcceptedPayload,
) {
  if (!state.player) return

  try {
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
          employeeRoles: payload.employeeRoles,
        },
        fromPlayerId: payload.partnerId,
        fromPlayerName: payload.partnerName,
      },
      state.turn,
      state.player.id,
      true,
    )

    initiatorBusiness.partnerBusinessId = payload.businessId

    if (state.performTransaction) {
      state.performTransaction(
        { money: -payload.yourInvestment },
        { title: 'Партнёрская инвестиция' },
      )
    } else if (state.applyStatChanges) {
      state.applyStatChanges({ money: -payload.yourInvestment })
    }

    set((state) => {
      if (!state.player) return state
      return {
        player: {
          ...state.player,
          businesses: [...state.player.businesses, initiatorBusiness],
        },
      }
    })

    broadcastEvent({
      type: 'PARTNERSHIP_UPDATED',
      payload: {
        businessId: payload.businessId,
        partnerBusinessId: initiatorBusiness.id,
      },
      toPlayerId: payload.partnerId,
    })

    state.pushNotification?.({
      type: 'success',
      title: 'Партнёрство создано',
      message: `Вы стали партнером с ${payload.partnerName} в бизнесе "${payload.businessName}"`,
    })
  } catch (error) {
    console.error('Error in onPartnershipAccepted:', error)
  }
}
