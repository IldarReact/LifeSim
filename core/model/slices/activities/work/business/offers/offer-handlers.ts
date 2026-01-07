import type { GameStore } from '../../../../types'

import { getMyConnectionId } from '@/core/lib/multiplayer'
import type { GameOffer } from '@/core/types/game-offers.types'

export interface OfferSentPayload {
  offer: GameOffer
}

export interface OfferRejectedPayload {
  offerId: string
}

export function handleOnOfferSent(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  payload: OfferSentPayload,
) {
  const myConnectionId = getMyConnectionId()
  const offer = payload.offer

  if (offer.toPlayerId === myConnectionId) {
    if (state.offers.some((o) => o.id === offer.id)) return

    set((state) => ({
      offers: [...state.offers, offer],
    }))

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
}

export function handleOnOfferRejected(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  payload: OfferRejectedPayload,
) {
  const { offerId } = payload

  set((state) => ({
    offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'rejected' } : o)),
  }))

  const offer = state.offers.find((o) => o.id === offerId)
  if (offer && offer.fromPlayerId === state.player?.id) {
    state.pushNotification?.({
      title: 'Предложение отклонено',
      message: `${offer.toPlayerName} отклонил ваше предложение`,
      type: 'info',
    })
  }
}
