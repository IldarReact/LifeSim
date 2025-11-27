// src/lib/multiplayer/index.ts
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { v4 as uuidv4 } from "uuid";

let doc: Y.Doc | null = null;
let provider: WebrtcProvider | null = null;
let roomId = "";

export function initMultiplayer(inputRoomId?: string): { doc: Y.Doc; roomId: string } {
  roomId = inputRoomId || uuidv4().slice(0, 8);

  // Меняем URL
  const url = new URL(window.location.href);
  url.searchParams.set("room", roomId);
  window.history.replaceState({}, "", url);

  doc = new Y.Doc();
  provider = new WebrtcProvider(roomId, doc, {
    signaling: ["wss://y-webrtc-signal.fly.dev"],
  });

  // Инициализируем awareness с дефолтными данными
  provider.awareness.setLocalState({
    user: {
      name: `Игрок ${Date.now().toString().slice(-4)}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    },
    isReady: false,
  });

  return { doc, roomId };
}

// Получить общий стейт игры
export function getSharedGameState() {
  if (!doc) throw new Error("Multiplayer not initialized");
  return doc.getMap("game");
}

// Кто онлайн (для HUD)
export function getOnlinePlayers() {
  if (!provider?.awareness) return [];
  return Array.from(provider.awareness.getStates().entries()).map(([id, state]: any) => ({
    clientId: id,
    name: state.user?.name || `Игрок ${id.toString().slice(0, 4)}`,
    color: state.user?.color || "#94a3b8",
    isReady: state.isReady || false,
  }));
}

// Установить имя игрока
export function setPlayerName(name: string) {
  if (!provider?.awareness) return;

  const currentState = provider.awareness.getLocalState() || {};
  provider.awareness.setLocalState({
    ...currentState,
    user: {
      ...(currentState.user || {}),
      name,
    },
  });
}

// Установить статус готовности текущего игрока
export function setPlayerReady(isReady: boolean) {
  if (!provider?.awareness) return;

  provider.awareness.setLocalStateField("isReady", isReady);
}

// Подписка на изменения статуса игроков
export function subscribeToReadyStatus(callback: (readyCount: number, totalPlayers: number) => void) {
  if (!provider?.awareness) return () => { };

  const handler = () => {
    const players = getOnlinePlayers();
    const readyCount = players.filter(p => p.isReady).length;
    const totalPlayers = players.length;
    callback(readyCount, totalPlayers);
  };

  provider.awareness.on("change", handler);

  // Вызываем сразу
  handler();

  return () => {
    provider?.awareness.off("change", handler);
  };
}

export function isMultiplayerActive() {
  return !!provider;
}