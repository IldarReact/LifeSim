/**
 * @deprecated This file is kept for backward compatibility.
 * Please import from './store' instead.
 *
 * The store has been refactored following FBA (Feature-Based Architecture) principles:
 * - slices/game-slice.ts - Core game logic (turn, year, status)
 * - slices/player-slice.ts - Player state management
 * - slices/education-slice.ts - Education system (courses, university)
 * - slices/job-slice.ts - Job applications and management
 * - slices/notification-slice.ts - Notification system
 * - logic/turn-logic.ts - Business logic for turn processing
 */

import { useGameStore } from './store'
export { useGameStore }

// Multiplayer

import { initMultiplayer, subscribeToEvents } from '../lib/multiplayer'
import {
  GameEvent,
  PartnershipAcceptedEvent,
  PartnershipUpdatedEvent,
  BusinessChangeProposedEvent,
  BusinessChangeApprovedEvent,
  BusinessChangeRejectedEvent,
  BusinessUpdatedEvent,
} from '../types/events.types'

let multiplayerSynced = false

export function enableMultiplayerSync() {
  if (multiplayerSynced) return
  multiplayerSynced = true
  const urlParams = new URLSearchParams(window.location.search)
  const room = urlParams.get('room')
  if (!room) return
  const roomId = initMultiplayer(room)

  const state = useGameStore.getState()

  // Liveblocks → Zustand (events)
  subscribeToEvents((event: GameEvent) => {
    console.log('Событие получено:', event.type, 'для игрока:', state.player?.id)

    // Filter events meant for other players if toPlayerId is specified
    if (event.toPlayerId && state.player && event.toPlayerId !== state.player.id) {
      return
    }

    // Partnership events
    if (event.type === 'PARTNERSHIP_ACCEPTED') {
      state.onPartnershipAccepted(event as PartnershipAcceptedEvent)
    }
    if (event.type === 'PARTNERSHIP_UPDATED') {
      state.onPartnershipUpdated(event as PartnershipUpdatedEvent)
    }

    // Business change events
    if (event.type === 'BUSINESS_CHANGE_PROPOSED') {
      state.onBusinessChangeProposed(event as BusinessChangeProposedEvent)
    }
    if (event.type === 'BUSINESS_CHANGE_APPROVED') {
      state.onBusinessChangeApproved(event as BusinessChangeApprovedEvent)
    }
    if (event.type === 'BUSINESS_CHANGE_REJECTED') {
      state.onBusinessChangeRejected(event as BusinessChangeRejectedEvent)
    }
    if (event.type === 'BUSINESS_UPDATED') {
      state.onBusinessUpdated(event as BusinessUpdatedEvent)
    }
  })
}