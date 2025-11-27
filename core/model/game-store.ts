
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

import { getSharedGameState, initMultiplayer } from '../lib/multiplayer';
import * as Y from "yjs";
import { useGameStore } from "./store";
import type { GameState } from "@/core/types";

let multiplayerSynced = false;
let doc: Y.Doc | null = null; // ← нужно хранить doc

export function enableMultiplayerSync() {
  if (multiplayerSynced) return;
  multiplayerSynced = true;

  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get("room");
  if (!room) return;

  // Инициализируем и сохраняем doc
  const { doc: yDoc } = initMultiplayer(room);
  doc = yDoc;

  console.log("Мультиплеер: подключено к комнате", room);

  const shared = getSharedGameState();
  const { getState, setState, subscribe } = useGameStore;

  // Y.js → Zustand
  shared.observeDeep(() => {
    const remoteData = shared.toJSON() as Partial<GameState>;

    setState((prev) => ({
      ...prev,
      ...remoteData,
      player: remoteData.player ?? prev.player,
      turn: remoteData.turn ?? prev.turn,
      gameStatus: remoteData.gameStatus ?? prev.gameStatus,
      // Добавь остальные поля по необходимости
    }));
  });

  // Zustand → Y.js (правильно — через doc.transact())
  const unsubscribe = subscribe((state: GameState) => {
    if (!doc) return;

    doc.transact(() => {
      shared.set("player", state.player);
      shared.set("turn", state.turn);
      shared.set("gameStatus", state.gameStatus);
      // Добавь нужные поля:
      // shared.set("businesses", state.player.businesses);
      // shared.set("familyMembers", state.player.personal.familyMembers);
    });
  });

  // Сохраняем отписку
  (window as any).__mp_unsubscribe = unsubscribe;
}