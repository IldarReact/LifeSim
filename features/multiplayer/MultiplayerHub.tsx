// features/multiplayer/MultiplayerHud.tsx
"use client";

import { getOnlinePlayers } from "@/core/lib/multiplayer";
import { initMultiplayer } from "@/core/lib/multiplayer"; // ← добавь импорт
import { Button } from "@/shared/ui/button";
import { Users, Link, Plus } from "lucide-react";

export function MultiplayerHud() {
  const players = getOnlinePlayers();

  // Если никто не в комнате — показываем кнопку создания
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const hasRoom = urlParams?.get("room");

  const createRoom = () => {
    initMultiplayer(); // генерирует ID и меняет URL
    alert("Комната создана! Скопируй ссылку и отправь друзьям!");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Ссылка скопирована!");
  };

  return (
    <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 z-50 max-w-xs">
      {/* Если ещё нет комнаты — предлагаем создать */}
      {!hasRoom ? (
        <div className="text-center">
          <p className="text-white/80 mb-4 text-sm">Ты один в игре</p>
          <Button onClick={createRoom} className="w-full bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Создать кооп-комнату
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6 text-white" />
            <span className="text-white font-bold">Онлайн: {players.length}</span>
          </div>

          <div className="space-y-2 mb-4">
            {players.map(p => (
              <div key={p.clientId} className="text-white/80 text-sm truncate">
                ● {p.name}
              </div>
            ))}
          </div>

          <Button onClick={copyLink} size="sm" className="w-full bg-white/10 hover:bg-white/20">
            <Link className="w-4 h-4 mr-2" />
            Пригласить друзей
          </Button>
        </>
      )}
    </div>
  );
}