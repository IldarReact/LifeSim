
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


export { useGameStore } from './store'

// Multiplayer

import { initMultiplayer, getSharedState } from '../lib/multiplayer';

let multiplayerSynced = false;

export function enableMultiplayerSync() {
  if (multiplayerSynced) return;
  multiplayerSynced = true;

  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get("room");
  if (!room) return;

  // Инициализируем Liveblocks
  const roomId = initMultiplayer(room);
  console.log("Мультиплеер: подключено к комнате", roomId);

  const shared = getSharedState();

  // Liveblocks → Zustand (presence)
  shared.subscribeToPresenceChanges(() => {
    // Можно обновлять список онлайн-игроков, если нужно
  });

  // Не используем storage для синхронизации - только presence
}