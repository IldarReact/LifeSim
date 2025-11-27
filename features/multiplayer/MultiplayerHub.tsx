// features/multiplayer/MultiplayerHud.tsx
"use client";

import { getOnlinePlayers } from "@/core/lib/multiplayer";
import { initMultiplayer } from "@/core/lib/multiplayer";
import { Button } from "@/shared/ui/button";
import { Users, Link, Plus, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeToReadyStatus } from "@/core/lib/multiplayer";

export function MultiplayerHud() {
  const [players, setPlayers] = useState(getOnlinePlayers());

  useEffect(() => {
    // Подписываемся на обновления статуса, чтобы перерисовывать список
    const unsubscribe = subscribeToReadyStatus(() => {
      setPlayers(getOnlinePlayers());
    });
    return () => unsubscribe();
  }, []);

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
    <div className="fixed top-20 right-4 md:top-24 md:right-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 z-40 max-w-xs shadow-xl transition-all hover:bg-black/30">
      {/* Если ещё нет комнаты — предлагаем создать */}
      {!hasRoom ? (
        <div className="text-center">
          <p className="text-white/60 mb-3 text-sm font-medium">Одиночная игра</p>
          <Button
            onClick={createRoom}
            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать лобби
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/70" />
              <span className="text-white font-bold text-sm">Игроки</span>
            </div>
            <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/60">
              {players.length} онлайн
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {players.map(p => (
              <div key={p.clientId} className="flex items-center justify-between text-sm group">
                <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate max-w-[120px]">{p.name}</span>
                </div>

                {p.isReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-white/20" />
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={copyLink}
            size="sm"
            className="w-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 hover:border-white/10 transition-all"
          >
            <Link className="w-3 h-3 mr-2" />
            Пригласить
          </Button>
        </>
      )}
    </div>
  );
}