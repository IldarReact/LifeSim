import { useGameStore } from './store'

import { initMultiplayer, subscribeToEvents } from '@/core/lib/multiplayer'
import {
  GameEvent,
  PartnershipAcceptedEvent,
  PartnershipUpdatedEvent,
  BusinessChangeProposedEvent,
  BusinessChangeApprovedEvent,
  BusinessChangeRejectedEvent,
  BusinessUpdatedEvent,
  JobOfferAcceptedEvent,
  OfferSentEvent,
  OfferRejectedEvent,
} from '@/core/types/events.types'

let multiplayerSynced = false

export function enableMultiplayerSync() {
  if (multiplayerSynced) return
  multiplayerSynced = true

  const urlParams = new URLSearchParams(window.location.search)
  const room = urlParams.get('room')
  if (!room) return

  initMultiplayer(room)

  const state = useGameStore.getState()

  // Liveblocks → Zustand (events)
  subscribeToEvents((event: GameEvent) => {
    console.log('Событие получено:', event.type, 'для игрока:', state.player?.id)

    // Filter events meant for other players if toPlayerId is specified
    if (event.toPlayerId && state.player && event.toPlayerId !== state.player.id) {
      return
    }

    switch (event.type) {
      // Partnership events
      case 'PARTNERSHIP_ACCEPTED':
        state.onPartnershipAccepted?.(event as PartnershipAcceptedEvent)
        break
      case 'PARTNERSHIP_UPDATED':
        state.onPartnershipUpdated?.(event as PartnershipUpdatedEvent)
        break

      // Business change events
      case 'BUSINESS_CHANGE_PROPOSED':
        state.onBusinessChangeProposed?.(event as BusinessChangeProposedEvent)
        break
      case 'BUSINESS_CHANGE_APPROVED':
        state.onBusinessChangeApproved?.(event as BusinessChangeApprovedEvent)
        break
      case 'BUSINESS_CHANGE_REJECTED':
        state.onBusinessChangeRejected?.(event as BusinessChangeRejectedEvent)
        break
      case 'BUSINESS_UPDATED':
        state.onBusinessUpdated?.(event as BusinessUpdatedEvent)
        break

      // Offer events
      case 'JOB_OFFER_ACCEPTED':
        state.onJobOfferAccepted?.(event as JobOfferAcceptedEvent)
        break
      case 'OFFER_SENT':
        state.onOfferSent?.(event as OfferSentEvent)
        break
      case 'OFFER_REJECTED':
        state.onOfferRejected?.(event as OfferRejectedEvent)
        break

      default:
        console.warn('Unknown event type:', event.type)
    }
  })
}
