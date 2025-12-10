// core/lib/multiplayer/index.ts
import { Player } from "@/features/multiplayer/MultiplayerHub";
import { createClient } from "@liveblocks/client";

type Presence = {
  name: string;
  isReady: boolean;
  turnReady: boolean;
  isHost: boolean;
  gameStarted: boolean;
  selectedArchetype: string | null;
  color: string;
};

let client: ReturnType<typeof createClient> | null = null;
let roomInstance: any = null;

async function getAuthToken(room: string) {
  const res = await fetch('/api/liveblocks-auth', {
    method: 'POST',
    body: JSON.stringify({ room }),
  });
  const data = await res.json();
  return data.token;
}

async function getClient(token: string) {
  if (!client) {
    client = createClient({
      authEndpoint: async () => ({ token }),
    });
  }
  return client;
}

export async function initMultiplayer(inputRoomId?: string, isCreator: boolean = false): Promise<string> {
  const id = inputRoomId || Math.random().toString(36).slice(2, 10);

  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set("room", id);
    window.history.replaceState({}, "", url.toString());
  }

  const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
  const randomName = `Игрок ${Date.now().toString().slice(-4)}`;

  try {
    const token = await getAuthToken(id);
    const clientInstance = await getClient(token);
    
    if (!clientInstance) {
      console.info('[Multiplayer] Liveblocks client not available — multiplayer disabled')
      return id
    }

    const { room } = clientInstance.enterRoom<Presence, any, any, any>(id, {
      initialPresence: {
        name: randomName,
        isReady: false,
        turnReady: false,
        isHost: isCreator,
        gameStarted: false,
        selectedArchetype: null,
        color: randomColor,
      },
    });
    roomInstance = room;
  } catch (error) {
    console.error('Failed to init multiplayer:', error);
  }

  return id;
}

export const isMultiplayerActive = () => !!roomInstance;

export const isHost = () => {
  if (!roomInstance) return false;
  const self = roomInstance.getSelf();
  return self?.presence.isHost || false;
};

export const getMyConnectionId = () => {
  if (!roomInstance) return null;
  const self = roomInstance.getSelf();
  return self ? String(self.connectionId) : null;
};

export function getOnlinePlayers(): Player[] {
  if (!roomInstance) return [];

  const others = roomInstance.getOthers();
  const self = roomInstance.getSelf();

  const players: Player[] = others.map((other: any) => ({
    clientId: String(other.connectionId),
    name: other.presence.name || "Игрок",
    color: other.presence.color || "#94a3b8",
    isReady: other.presence.isReady || false,
    turnReady: other.presence.turnReady || false,
    isHost: other.presence.isHost || false,
    gameStarted: other.presence.gameStarted || false,
    selectedArchetype: other.presence.selectedArchetype || null,
    isLocal: false,
  }));

  if (self) {
    players.unshift({
      clientId: String(self.connectionId),
      name: self.presence.name || "Игрок",
      color: self.presence.color || "#94a3b8",
      isReady: self.presence.isReady || false,
      turnReady: self.presence.turnReady || false,
      isHost: self.presence.isHost || false,
      gameStarted: self.presence.gameStarted || false,
      selectedArchetype: self.presence.selectedArchetype || null,
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

export function setTurnReady(ready: boolean) {
  if (!roomInstance) return;
  roomInstance.updatePresence({ turnReady: ready });
}

export function setSelectedArchetype(archetype: string | null) {
  if (!roomInstance) return;
  roomInstance.updatePresence({ selectedArchetype: archetype });
}

export function startGame() {
  if (!roomInstance) return;
  if (!isHost()) {
    console.warn("Only host can start the game");
    return;
  }
  roomInstance.updatePresence({ gameStarted: true });
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
  handler();

  return unsubscribe;
}

export function subscribeToTurnReadyStatus(
  callback: (readyCount: number, totalPlayers: number, allReady: boolean) => void
) {
  if (!roomInstance) return () => { };

  const handler = () => {
    const players = getOnlinePlayers();
    const readyCount = players.filter((p: Player) => p.turnReady).length;
    const totalPlayers = players.length;
    const allReady = totalPlayers > 1 && readyCount === totalPlayers;

    callback(readyCount, totalPlayers, allReady);
  };

  const unsubscribe = roomInstance.subscribe("others", handler);
  const unsubscribeSelf = roomInstance.subscribe("my-presence", handler);
  handler();

  return () => {
    unsubscribe();
    unsubscribeSelf();
  };
}

export function subscribeToGameStart(callback: () => void) {
  if (!roomInstance) return () => { };

  const handler = () => {
    const players = getOnlinePlayers();
    const hostPlayer = players.find(p => p.isHost);

    if (hostPlayer?.gameStarted) {
      callback();
    }
  };

  const unsubscribe = roomInstance.subscribe("others", handler);
  const unsubscribeSelf = roomInstance.subscribe("my-presence", handler);

  return () => {
    unsubscribe();
    unsubscribeSelf();
  };
}

export function syncTurnAdvance(callback: () => void) {
  if (!roomInstance) return () => { };
  return () => { };
}

export function triggerTurnAdvance() {
  // Не используем
}

export function broadcastEvent(event: any) {
  if (!roomInstance) return;
  roomInstance.broadcastEvent(event);
}

export function subscribeToEvents(callback: (event: any) => void) {
  if (!roomInstance) return () => { };
  return roomInstance.subscribe("event", ({ event }: { event: any }) => callback(event));
}

export const getSharedState = () => ({
  subscribeToPresenceChanges: (cb: () => void) => {
    if (!roomInstance) return () => { };
    return roomInstance.subscribe("others", cb);
  },
  subscribeToStorageChanges: (cb: () => void) => {
    if (!roomInstance) return () => { };
    return roomInstance.subscribe("others", cb);
  },
  getStorage: () => {
    return null;
  },
  setStorage: () => {
    // Не используем storage
  },
});
