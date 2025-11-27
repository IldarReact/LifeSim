// src/lib/multiplayer/index.ts
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { v4 as uuidv4 } from "uuid";

let doc: Y.Doc | null = null;
let provider: WebrtcProvider | null = null;
let roomId = "";
let localClientId: number | null = null;

export function initMultiplayer(inputRoomId?: string): { doc: Y.Doc; roomId: string } {
  roomId = inputRoomId || uuidv4().slice(0, 8);

  // Меняем URL
  const url = new URL(window.location.href);
  url.searchParams.set("room", roomId);
  window.history.replaceState({}, "", url);

  doc = new Y.Doc();
  provider = new WebrtcProvider(roomId, doc, {
    signaling: [
      "wss://signaling.yjs.dev",
      "wss://y-webrtc-signaling.herokuapp.com",
      "wss://y-webrtc-signal.fly.dev"
    ],
  });

  // Сохраняем ID локального клиента
  localClientId = provider.awareness.clientID;

  // Генерируем случайный цвет
  const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
  const randomName = `Игрок ${Date.now().toString().slice(-4)}`;

  // Инициализируем awareness с дефолтными данными
  // ВАЖНО: используем setLocalState, а не setLocalStateField
  provider.awareness.setLocalState({
    user: {
      name: randomName,
      color: randomColor,
    },
    isReady: false,
  });

  // Логируем для дебага
  console.log(`[Multiplayer] Подключено к комнате: ${roomId}`);
  console.log(`[Multiplayer] Локальный клиент ID: ${localClientId}`);
  console.log(`[Multiplayer] Имя: ${randomName}, Цвет: ${randomColor}`);

  // Слушаем изменения awareness для дебага
  const currentProvider = provider;
  provider.awareness.on("change", () => {
    if (!currentProvider) return;
    const states = Array.from(currentProvider.awareness.getStates().entries());
    console.log(`[Multiplayer] Awareness изменён. Всего клиентов: ${states.length}`);
    states.forEach(([id, state]: any) => {
      console.log(`  - Клиент ${id}: ${state.user?.name || 'без имени'}`);
    });
  });

  return { doc, roomId };
}

// Получить общий стейт игры
export function getSharedGameState() {
  if (!doc) throw new Error("Multiplayer not initialized");
  return doc.getMap("game");
}

// Получить ID локального клиента
export function getLocalClientId() {
  return localClientId;
}

// Кто онлайн (для HUD)
export function getOnlinePlayers() {
  if (!provider?.awareness) {
    console.warn("[Multiplayer] Provider или awareness не инициализирован");
    return [];
  }

  const states = Array.from(provider.awareness.getStates().entries());

  console.log(`[Multiplayer] getOnlinePlayers: ${states.length} клиентов`);

  return states.map(([id, state]: any) => {
    const player = {
      clientId: id,
      name: state.user?.name || `Игрок ${id.toString().slice(0, 4)}`,
      color: state.user?.color || "#94a3b8",
      isReady: state.isReady || false,
      isLocal: id === localClientId,
    };

    console.log(`  - Игрок ${id}: ${player.name} (local: ${player.isLocal})`);

    return player;
  });
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

  console.log(`[Multiplayer] Имя изменено на: ${name}`);
}

// Установить статус готовности текущего игрока
export function setPlayerReady(isReady: boolean) {
  if (!provider?.awareness) return;

  const currentState = provider.awareness.getLocalState() || {};
  provider.awareness.setLocalState({
    ...currentState,
    isReady,
  });

  console.log(`[Multiplayer] Статус готовности: ${isReady}`);
}

// Подписка на изменения статуса игроков
export function subscribeToReadyStatus(callback: (readyCount: number, totalPlayers: number, allReady: boolean) => void) {
  if (!provider?.awareness) return () => { };

  const handler = () => {
    const players = getOnlinePlayers();
    const readyCount = players.filter(p => p.isReady).length;
    const totalPlayers = players.length;
    const allReady = totalPlayers > 1 && readyCount === totalPlayers;

    console.log(`[Multiplayer] Ready status: ${readyCount}/${totalPlayers} (allReady: ${allReady})`);

    callback(readyCount, totalPlayers, allReady);
  };

  provider.awareness.on("change", handler);

  // Вызываем сразу
  handler();

  return () => {
    provider?.awareness.off("change", handler);
  };
}

// Синхронизировать переход хода
export function syncTurnAdvance(callback: () => void) {
  if (!doc) return () => { };

  const turnMap = doc.getMap("turnSync");

  const observer = () => {
    const shouldAdvance = turnMap.get("advance");
    if (shouldAdvance) {
      console.log("[Multiplayer] Получен сигнал перехода хода");
      callback();
      // Сбрасываем флаг
      turnMap.set("advance", false);
    }
  };

  turnMap.observe(observer);

  return () => {
    turnMap.unobserve(observer);
  };
}

// Триггер перехода хода для всех
export function triggerTurnAdvance() {
  if (!doc) return;

  console.log("[Multiplayer] Триггерим переход хода для всех");

  const turnMap = doc.getMap("turnSync");
  turnMap.set("advance", true);
  turnMap.set("timestamp", Date.now());
}

export function isMultiplayerActive() {
  return !!provider && !!localClientId;
}