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
  }));
}