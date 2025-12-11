"use client";

import { getOnlinePlayers, setPlayerName } from "@/core/lib/multiplayer";
import { Button } from "@/shared/ui/button";
import { Users, Link, Plus, CheckCircle2, Circle, ChevronDown, ChevronUp, Edit2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeToReadyStatus } from "@/core/lib/multiplayer";

export type Player = {
  clientId: string;
  name: string;
  color: string;
  isReady: boolean;
  turnReady?: boolean;
  isHost?: boolean;
  gameStarted?: boolean;
  selectedArchetype?: string | null;
  isLocal: boolean;
};

export function MultiplayerHud() {
  const [players, setPlayers] = useState<Player[]>(getOnlinePlayers());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    // Подписываемся на обновления статуса, чтобы перерисовывать список
    const unsubscribe = subscribeToReadyStatus(() => {
      setPlayers(getOnlinePlayers());
    });

    // Дополнительно: обновляем список каждую секунду
    const interval = setInterval(() => {
      setPlayers(getOnlinePlayers());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Если никто не в комнате — показываем кнопку создания
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const hasRoom = urlParams?.get("room");

  const createRoom = () => {
    const roomId = Math.random().toString(36).slice(2, 10);
    window.location.href = `/lobby?room=${roomId}`;
  };

  const handleSaveName = () => {
    if (newName.trim()) {
      setPlayerName(newName.trim());
      setIsEditingName(false);
      setNewName("");
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setNewName("");
  };

  return (
    <div className="fixed top-20 right-4 md:top-24 md:right-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl z-40 max-w-xs shadow-xl transition-all hover:bg-black/30">
      {hasRoom && (
        <>
          {/* Header - всегда видим */}
          <div
            className="flex items-center justify-between gap-3 p-4 cursor-pointer select-none"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/70" />
              <span className="text-white font-bold text-sm">Игроки</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/60">
                {players.length}
              </span>
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4 text-white/50" />
              ) : (
                <ChevronUp className="w-4 h-4 text-white/50" />
              )}
            </div>
          </div>

          {/* Content - сворачивается */}
          {!isCollapsed && (
            <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
              {/* Редактирование имени */}
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Введи своё имя"
                    maxLength={20}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Сохранить
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsEditingName(true)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 hover:border-white/10 transition-all"
                >
                  <Edit2 className="w-3 h-3 mr-2" />
                  Изменить ник
                </Button>
              )}

              {/* Список игроков */}
              <div className="space-y-2">
                {players.map((p: Player) => (
                  <div key={p.clientId} className="flex items-center justify-between text-sm group">
                    <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="truncate max-w-[120px]">
                        {p.name}
                        {p.isLocal && <span className="text-white/40 ml-1">(вы)</span>}
                      </span>
                    </div>

                    {p.isReady ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-white/20" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}