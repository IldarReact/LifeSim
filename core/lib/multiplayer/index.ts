// core/lib/multiplayer/index.ts
import { createClient } from "@liveblocks/client";

type Presence = {
  name: string;
  isReady: boolean;
  color: string;
};

type Storage = {
  game?: any;
  turnAdvance?: boolean;
  timestamp?: number;
};

let client: ReturnType<typeof createClient> | null = null;
let roomInstance: any = null;

function getClient() {
  if (!client) {
    const publicKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error(
        "NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY is not set. Multiplayer features are disabled."
      );
    }
    client = createClient({
      publicApiKey: publicKey,
    });
  }
  return client;
}

// ---------- инициализация ----------
export function initMultiplayer(inputRoomId?: string): string {
  const id = inputRoomId || Math.random().toString(36).slice(2, 10);

  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set("room", id);
    window.history.replaceState({}, "", url.toString());
  }

  const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
  const randomName = `Игрок ${Date.now().toString().slice(-4)}`;

  const { room } = getClient().enterRoom<Presence, Storage, any, any>(id, {
    initialPresence: {
      name: randomName,
      isReady: false,
      color: randomColor,
    },
  });

  roomInstance = room;

  console.log(`[Multiplayer] Connected to Liveblocks room: ${id}`);

  return id;
}

export function getSharedGameState() {
  if (!roomInstance) throw new Error("Multiplayer not initialized");
  return roomInstance.getStorage();
}

export const isMultiplayerActive = () => !!roomInstance;

// ---------- Функции для работы с игроками (Presence) ----------

type Player = {
  clientId: number;
  name: string;
  color: string;
  isReady: boolean;
  isLocal: boolean;
};

export function getOnlinePlayers(): Player[] {
  if (!roomInstance) return [];

  const others = roomInstance.getOthers();
  const self = roomInstance.getSelf();

  const players: Player[] = others.map((other: any) => ({
    clientId: other.connectionId,
    name: other.presence.name || "Игрок",
    color: other.presence.color || "#94a3b8",
    isReady: other.presence.isReady || false,
    isLocal: false,
  }));

  if (self) {
    players.unshift({
      clientId: self.connectionId,
      name: self.presence.name || "Игрок",
      color: self.presence.color || "#94a3b8",
      isReady: self.presence.isReady || false,
      isLocal: true,
    });
  }

  return players;
}

export function setPlayerName(name: string) {
  if (!roomInstance) return;
  roomInstance.updatePresence({ name });
}

export function setPlayerReady(ready: boolean) {
  if (!roomInstance) return;
  roomInstance.updatePresence({ isReady: ready });
}

export function subscribeToReadyStatus(
  callback: (readyCount: number, totalPlayers: number, allReady: boolean) => void
) {
  if (!roomInstance) return () => { };

  const handler = () => {
    const players = getOnlinePlayers();
    const readyCount = players.filter((p: Player) => p.isReady).length;
    const totalPlayers = players.length;
    const allReady = totalPlayers > 1 && readyCount === totalPlayers;

    callback(readyCount, totalPlayers, allReady);
  };

  const unsubscribe = roomInstance.subscribe("others", handler);
  handler(); // Вызываем сразу

  return unsubscribe;
}

// ---------- Функции синхронизации хода ----------

export function syncTurnAdvance(callback: () => void) {
  if (!roomInstance) return () => { };

  const handler = () => {
    roomInstance.getStorage().then((storage: any) => {
      const shouldAdvance = storage.get("turnAdvance");
      if (shouldAdvance) {
        callback();
        // Сбрасываем флаг
        if (isMultiplayerActive()) {
          storage.set("turnAdvance", false);
        }
      }
    });
  };

  const unsubscribe = roomInstance.subscribe("storage", handler);
  return unsubscribe;
}

export function triggerTurnAdvance() {
  if (!roomInstance) return;
  roomInstance.getStorage().then((storage: any) => {
    storage.set("turnAdvance", true);
    storage.set("timestamp", Date.now());
  });
}

// Вспомогательная функция для game-store.ts
export const getSharedState = () => ({
  storage: roomInstance?.getStorage(),
  subscribeToPresenceChanges: (cb: () => void) => {
    if (!roomInstance) return () => { };
    return roomInstance.subscribe("others", cb);
  },
  subscribeToStorageChanges: (cb: () => void) => {
    if (!roomInstance) return () => { };
    return roomInstance.subscribe("storage", cb);
  },
});