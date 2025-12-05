import { useEffect } from 'react'
import { useGameStore } from '@/core/model/store'
import { subscribeToEvents } from '@/core/lib/multiplayer'
import type { GameOffer } from '@/core/types/game-offers.types'

export function useOffersSync() {
  const { player, pushNotification } = useGameStore()

  useEffect(() => {
    const unsubscribe = subscribeToEvents(({ type, payload }) => {
      if (type === 'OFFER_SENT') {
        const offer = payload.offer as GameOffer

        // Если оффер нам
        if (offer.toPlayerId === player?.id) {
          // Добавляем в store
          useGameStore.setState(state => ({
            offers: [...state.offers, offer]
          }))

          // Показываем уведомление
          pushNotification({
            title: "Новое предложение!",
            description: `От ${offer.fromPlayerName}`,
            type: "info"
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
            description: `${offer.toPlayerName} принял ваше предложение`,
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
            description: `${offer.toPlayerName} отклонил ваше предложение`,
            type: "warning"
          })
        }
      }
    })

    return () => unsubscribe()
  }, [player?.id])
}
