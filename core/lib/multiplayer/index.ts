// core/lib/multiplayer/index.ts
import { Player } from "@/features/multiplayer/MultiplayerHub";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

type Presence = {
  name: string;
  isReady: boolean;
  turnReady: boolean;
  isHost: boolean;
  gameStarted: boolean;
  selectedArchetype: string | null;
  color: string;
  clientId: string;
};

let doc: Y.Doc | null = null;
let provider: WebrtcProvider | null = null;
let awareness: any = null;
let localClientId: string = "";

export function initMultiplayer(inputRoomId?: string, isCreator: boolean = false): string {
  const id = inputRoomId || Math.random().toString(36).slice(2, 10);

  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set("room", id);
    window.history.replaceState({}, "", url.toString());
  }

  const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
  const randomName = `Игрок ${Date.now().toString().slice(-4)}`;
  localClientId = Math.random().toString(36).slice(2, 11);

  doc = new Y.Doc();
  provider = new WebrtcProvider(id, doc, {
    signaling: ['wss://signaling.yjs.dev'],
  });

  awareness = provider.awareness;
  awareness.setLocalState({
    name: randomName,
    isReady: false,
    turnReady: false,
    isHost: isCreator,
    gameStarted: false,
    selectedArchetype: null,
    color: randomColor,
    clientId: localClientId,
  });

  return id;
}

export const isMultiplayerActive = () => !!provider;

export const isHost = () => {
  if (!awareness) return false;
  const state = awareness.getLocalState();
  return state?.isHost || false;
};

export const getMyConnectionId = () => localClientId;

export function getOnlinePlayers(): Player[] {
  if (!awareness) return [];

  const players: Player[] = [];
  const states = awareness.getStates();

  states.forEach((state: any, clientId: number) => {
    const isLocal = state.clientId === localClientId;
    players.push({
      clientId: state.clientId || String(clientId),
      name: state.name || "Игрок",
      color: state.color || "#94a3b8",
      isReady: state.isReady || false,
      turnReady: state.turnReady || false,
      isHost: state.isHost || false,
      gameStarted: state.gameStarted || false,
      selectedArchetype: state.selectedArchetype || null,
      isLocal,
    });
  });

  return players;
}

export function setPlayerName(name: string) {
  if (!awareness) return;
  const state = awareness.getLocalState();
  awareness.setLocalState({ ...state, name });
}

export function setPlayerReady(ready: boolean) {
  if (!awareness) return;
  const state = awareness.getLocalState();
  awareness.setLocalState({ ...state, isReady: ready });
}

export function setTurnReady(ready: boolean) {
  if (!awareness) return;
  const state = awareness.getLocalState();
  awareness.setLocalState({ ...state, turnReady: ready });
}

export function setSelectedArchetype(archetype: string | null) {
  if (!awareness) return;
  const state = awareness.getLocalState();
  awareness.setLocalState({ ...state, selectedArchetype: archetype });
}

export function startGame() {
  if (!awareness) return;
  if (!isHost()) {
    console.warn("Only host can start the game");
    return;
  }
  const state = awareness.getLocalState();
  awareness.setLocalState({ ...state, gameStarted: true });
}

export function subscribeToReadyStatus(
  callback: (readyCount: number, totalPlayers: number, allReady: boolean) => void
) {
  if (!awareness) return () => { };

  const handler = () => {
    const players = getOnlinePlayers();
    const readyCount = players.filter((p: Player) => p.isReady).length;
    const totalPlayers = players.length;
    const allReady = totalPlayers > 1 && readyCount === totalPlayers;
    callback(readyCount, totalPlayers, allReady);
  };

  awareness.on('change', handler);
  handler();

  return () => awareness.off('change', handler);
}

export function subscribeToTurnReadyStatus(
  callback: (readyCount: number, totalPlayers: number, allReady: boolean) => void
) {
  if (!awareness) return () => { };

  const handler = () => {
    const players = getOnlinePlayers();
    const readyCount = players.filter((p: Player) => p.turnReady).length;
    const totalPlayers = players.length;
    const allReady = totalPlayers > 1 && readyCount === totalPlayers;
    callback(readyCount, totalPlayers, allReady);
  };

  awareness.on('change', handler);
  handler();

  return () => awareness.off('change', handler);
}

export function subscribeToGameStart(callback: () => void) {
  if (!awareness) return () => { };

  const handler = () => {
    const players = getOnlinePlayers();
    const hostPlayer = players.find(p => p.isHost);
    if (hostPlayer?.gameStarted) {
      callback();
    }
  };

  awareness.on('change', handler);

  return () => awareness.off('change', handler);
}

export function syncTurnAdvance(callback: () => void) {
  if (!awareness) return () => { };
  return () => { };
}

export function triggerTurnAdvance() {
  // Не используем
}

export function broadcastEvent(event: any) {
  if (!doc) return;
  const events = doc.getArray('events');
  events.push([{ ...event, timestamp: Date.now() }]);
}

export function subscribeToEvents(callback: (event: any) => void) {
  if (!doc) return () => { };
  const events = doc.getArray('events');
  
  const handler = () => {
    const lastEvent = events.get(events.length - 1);
    if (lastEvent) callback(lastEvent);
  };
  
  events.observe(handler);
  return () => events.unobserve(handler);
}

export const getSharedState = () => ({
  subscribeToPresenceChanges: (cb: () => void) => {
    if (!awareness) return () => { };
    awareness.on('change', cb);
    return () => awareness.off('change', cb);
  },
  subscribeToStorageChanges: (cb: () => void) => {
    if (!doc) return () => { };
    const d = doc;
    d.on('update', cb);
    return () => d.off('update', cb);
  },
  getStorage: () => {
    return doc;
  },
  setStorage: () => {
    // Не используем storage
  },
});
