import { useEffect } from 'react'

import { subscribeToEvents, getMyConnectionId, broadcastEvent } from '@/core/lib/multiplayer'
import { useGameStore } from '@/core/model/store'
import {
  GameOffer,
  isJobOffer,
  isPartnershipOffer,
  isShareSaleOffer,
} from '@/core/types/game-offers.types'

export function useOffersSync() {
  const { player, pushNotification } = useGameStore()

  useEffect(() => {
    const unsubscribe = subscribeToEvents((event) => {
      const myConnectionId = getMyConnectionId()
      console.log('[OffersSync] Event received:', event.type, event.payload, 'My ID:', myConnectionId)

      if (event.type === 'OFFER_SENT') {
        const { offer } = event.payload
        console.log(
          '[OffersSync] Checking offer recipient:',
          offer.toPlayerId,
          'vs',
          myConnectionId,
        )

        // Если оффер нам (сравниваем connectionId)
        if (offer.toPlayerId === myConnectionId) {
          console.log('[OffersSync] Offer accepted for me!')
          // Добавляем в store
          useGameStore.setState((state) => ({
            offers: [...state.offers, offer],
          }))

          // Показываем уведомление
          pushNotification({
            title: 'Новое предложение!',
            message: `От ${offer.fromPlayerName}`,
            type: 'info',
            data: {
              offerId: offer.id,
              type: 'offer_received',
            },
          })
        }
      } else if (event.type === 'OFFER_ACCEPTED') {
        const { offerId } = event.payload
        const state = useGameStore.getState()

        // Обновляем статус оффера
        useGameStore.setState((state) => ({
          offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'accepted' } : o)),
        }))

        // Если это наш оффер, показываем уведомление и выполняем действия
        const offer = state.offers.find((o) => o.id === offerId)
        if (!offer) {
          console.error('Offer not found:', offerId)
          return
        }
        if (offer && offer.fromPlayerId === player?.id) {
          pushNotification({
            title: 'Предложение принято!',
            message: `${offer.toPlayerName} принял ваше предложение`,
            type: 'success',
            data: { type: 'success' },
          })

          if (isJobOffer(offer)) {
            state.addEmployeeToBusiness(
              offer.details.businessId,
              offer.toPlayerName,
              offer.details.role,
              offer.details.salary,
              offer.toPlayerId,
            )
          } else if (isPartnershipOffer(offer)) {
            state.addPartnerToBusiness(
              offer.details.businessId,
              offer.toPlayerId,
              offer.toPlayerName,
              offer.details.yourShare,
              offer.details.yourInvestment,
            )

            // Отправляем обновленный бизнес партнеру
            const updatedBusiness = useGameStore
              .getState()
              .player?.businesses.find((b) => b.id === offer.details.businessId)
            if (updatedBusiness) {
              broadcastEvent({
                type: 'BUSINESS_SYNC',
                payload: { business: updatedBusiness, targetPlayerId: offer.toPlayerId },
              })
            }
          } else if (isShareSaleOffer(offer)) {
            state.addPartnerToBusiness(
              offer.details.businessId,
              offer.toPlayerId,
              offer.toPlayerName,
              offer.details.sharePercent,
              offer.details.price,
            )

            // Отправляем обновленный бизнес партнеру
            const updatedBusiness = useGameStore
              .getState()
              .player?.businesses.find((b) => b.id === offer.details.businessId)
            if (updatedBusiness) {
              broadcastEvent({
                type: 'BUSINESS_SYNC',
                payload: { business: updatedBusiness, targetPlayerId: offer.toPlayerId },
              })
            }
          }
        }
      } else if (event.type === 'BUSINESS_SYNC') {
        const { business, targetPlayerId } = event.payload
        const myId = getMyConnectionId()

        if (targetPlayerId === myId) {
          console.log('[OffersSync] Received shared business:', business.name)
          useGameStore.getState().addSharedBusiness(business)

          pushNotification({
            title: 'Бизнес добавлен',
            message: `Вы стали совладельцем ${business.name}`,
            type: 'success',
            data: { type: 'success' },
          })
        }
      } else if (event.type === 'OFFER_REJECTED') {
        const { offerId } = event.payload

        // Обновляем статус оффера
        useGameStore.setState((state) => ({
          offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'rejected' } : o)),
        }))

        // Если это наш оффер, показываем уведомление
        const offer = useGameStore.getState().offers.find((o) => o.id === offerId)
        if (offer && offer.fromPlayerId === player?.id) {
          pushNotification({
            title: 'Предложение отклонено',
            message: `${offer.toPlayerName} отклонил ваше предложение`,
            type: 'warning',
            data: { type: 'warning' },
          })
        }
      }
    })

    return () => unsubscribe()
  }, [player?.id, pushNotification])
}
