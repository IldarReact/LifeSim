import { useEffect } from 'react'
import { useGameStore } from '@/core/model/store'
import { subscribeToEvents, getMyConnectionId } from '@/core/lib/multiplayer'
import type { GameOffer } from '@/core/types/game-offers.types'

export function useOffersSync() {
  const { player, pushNotification } = useGameStore()

  useEffect(() => {
    const unsubscribe = subscribeToEvents(({ type, payload }) => {
      const myConnectionId = getMyConnectionId()
      console.log('[OffersSync] Event received:', type, payload, 'My ID:', myConnectionId)

      if (type === 'OFFER_SENT') {
        const offer = payload.offer as GameOffer
        console.log('[OffersSync] Checking offer recipient:', offer.toPlayerId, 'vs', myConnectionId)

        // Если оффер нам (сравниваем connectionId)
        if (offer.toPlayerId === myConnectionId) {
          console.log('[OffersSync] Offer accepted for me!')
          // Добавляем в store
          useGameStore.setState(state => ({
            offers: [...state.offers, offer]
          }))

          // Показываем уведомление
          pushNotification({
            title: "Новое предложение!",
            message: `От ${offer.fromPlayerName}`,
            type: "info",
            data: {
              offerId: offer.id,
              type: 'offer_received'
            }
          })
        }
      }
      else if (type === 'OFFER_ACCEPTED') {
        const { offerId, acceptedBy } = payload

        // Обновляем статус оффера
        useGameStore.setState(state => ({
          offers: state.offers.map(o =>
            o.id === offerId ? { ...o, status: 'accepted' } : o
          )
        }))

        // Если это наш оффер, показываем уведомление
        const offer = useGameStore.getState().offers.find(o => o.id === offerId)
        if (offer && offer.fromPlayerId === player?.id) {
          pushNotification({
            title: "Предложение принято!",
            message: `${offer.toPlayerName} принял ваше предложение`,
            type: "success"
          })
        }
      }
      else if (type === 'OFFER_REJECTED') {
        const { offerId, rejectedBy } = payload

        // Обновляем статус оффера
        useGameStore.setState(state => ({
          offers: state.offers.map(o =>
            o.id === offerId ? { ...o, status: 'rejected' } : o
          )
        }))

        // Если это наш оффер, показываем уведомление
        const offer = useGameStore.getState().offers.find(o => o.id === offerId)
        if (offer && offer.fromPlayerId === player?.id) {
          pushNotification({
            title: "Предложение отклонено",
            message: `${offer.toPlayerName} отклонил ваше предложение`,
            type: "warning"
          })
        }
      }
    })

    return () => unsubscribe()
  }, [player?.id])
}
