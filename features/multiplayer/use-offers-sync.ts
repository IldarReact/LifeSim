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
        const state = useGameStore.getState()

        // Обновляем статус оффера
        useGameStore.setState(state => ({
          offers: state.offers.map(o =>
            o.id === offerId ? { ...o, status: 'accepted' } : o
          )
        }))

        // Если это наш оффер, показываем уведомление и выполняем действия
        const offer = state.offers.find(o => o.id === offerId)
        if (offer && offer.fromPlayerId === player?.id) {
          pushNotification({
            title: "Предложение принято!",
            message: `${offer.toPlayerName} принял ваше предложение`,
            type: "success"
          })

          // Импортируем хелперы динамически или предполагаем их наличие в скоупе (лучше импортировать сверху)
          // Но так как replace не позволяет легко добавить импорты сверху без замены всего файла,
          // я добавлю логику проверки типа вручную или использую offer.type

          if (offer.type === 'job_offer') {
            state.addEmployeeToBusiness(
              offer.details.businessId,
              offer.toPlayerName,
              offer.details.role,
              offer.details.salary,
              offer.toPlayerId
            )
          } else if (offer.type === 'business_partnership') {
            state.addPartnerToBusiness(
              offer.details.businessId,
              offer.toPlayerId,
              offer.toPlayerName,
              offer.details.yourShare,
              offer.details.yourInvestment
            )

            // Отправляем обновленный бизнес партнеру
            const updatedBusiness = useGameStore.getState().player?.businesses.find(b => b.id === offer.details.businessId)
            if (updatedBusiness) {
              // Используем broadcastEvent, который нужно импортировать. 
              // Но он уже импортирован в этом файле? Нет, только subscribeToEvents.
              // Придется добавить импорт.
            }
          } else if (offer.type === 'share_sale') {
            state.addPartnerToBusiness(
              offer.details.businessId,
              offer.toPlayerId,
              offer.toPlayerName,
              offer.details.shareAmount,
              offer.details.price
            )
          }

          // Для партнерства и продажи доли нужно синхронизировать бизнес
          if (offer.type === 'business_partnership' || offer.type === 'share_sale') {
            const updatedBusiness = useGameStore.getState().player?.businesses.find(b => b.id === offer.details.businessId)
            if (updatedBusiness) {
              import('@/core/lib/multiplayer').then(({ broadcastEvent }) => {
                broadcastEvent({
                  type: 'BUSINESS_SYNC',
                  payload: { business: updatedBusiness, targetPlayerId: offer.toPlayerId }
                })
              })
            }
          }
        }
      }
      else if (type === 'BUSINESS_SYNC') {
        const { business, targetPlayerId } = payload
        const myId = getMyConnectionId()

        if (targetPlayerId === myId) {
          console.log('[OffersSync] Received shared business:', business.name)
          useGameStore.getState().addSharedBusiness(business)

          pushNotification({
            title: "Бизнес добавлен",
            message: `Вы стали совладельцем ${business.name}`,
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
