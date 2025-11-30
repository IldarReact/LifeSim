"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Loader2, Users, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { getOnlinePlayers, subscribeToTurnReadyStatus, setTurnReady } from "@/core/lib/multiplayer";
import { Player } from "./MultiplayerHub";

interface TurnSyncModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onAllReady: () => void;
}

export function TurnSyncModal({ isOpen, onCancel, onAllReady }: TurnSyncModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [readyCount, setReadyCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    // Обновляем список игроков
    const updateListPlayers = () => {
      setPlayers(getOnlinePlayers());
    };

    // Подписываемся на изменения статуса готовности
    const unsubscribe = subscribeToTurnReadyStatus((ready, total, allReady) => {
      setReadyCount(ready);
      setTotalPlayers(total);
      updateListPlayers();

      // Если все готовы, вызываем callback
      if (allReady) {
        onAllReady();
      }
    });

    // Обновляем сразу
    updateListPlayers();

    return () => {
      unsubscribe();
    };
  }, [isOpen, onAllReady]);

  const handleCancel = () => {
    setTurnReady(false);
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            Ожидание других игроков
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Прогресс */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {readyCount} / {totalPlayers}
            </div>
            <p className="text-white/60 text-sm">
              игроков завершили ход
            </p>
          </div>

          {/* Прогресс-бар */}
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${totalPlayers > 0 ? (readyCount / totalPlayers) * 100 : 0}%` }}
            />
          </div>

          {/* Список игроков */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
              <Users className="w-4 h-4" />
              <span>Статус игроков:</span>
            </div>
            {players.map((player) => (
              <div
                key={player.clientId}
                className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="text-white/90">
                    {player.name}
                    {player.isLocal && <span className="text-white/40 ml-1">(вы)</span>}
                  </span>
                </div>
                {player.turnReady ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-white/20" />
                )}
              </div>
            ))}
          </div>

          {/* Информация */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              <strong>Совет:</strong> Пока вы ждете, можете просматривать интерфейс, но изменения вносить нельзя.
            </p>
          </div>

          {/* Кнопка отмены */}
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10"
          >
            Отменить и продолжить играть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
