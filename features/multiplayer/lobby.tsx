"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import {
  getOnlinePlayers,
  setPlayerName,
  setSelectedArchetype,
  startGame,
  subscribeToGameStart,
  isHost,
  initMultiplayer
} from "@/core/lib/multiplayer";
import { useGameStore } from "@/core/model/game-store";
import type { CharacterArchetype } from "@/core/types/job.types";
import { Users, Crown, Play, Link as LinkIcon, Check } from "lucide-react";

type Player = {
  clientId: number;
  name: string;
  color: string;
  isHost: boolean;
  selectedArchetype: string | null;
  isLocal: boolean;
};

const ARCHETYPES: { id: CharacterArchetype; name: string; description: string }[] = [
  { id: "investor", name: "Инвестор", description: "Начальный капитал: $50,000" },
  { id: "specialist", name: "Специалист", description: "Зарплата: $4,000/мес" },
  { id: "entrepreneur", name: "Предприниматель", description: "Бонус к бизнесу" },
  { id: "worker", name: "Рабочий", description: "Стабильный доход" },
  { id: "indebted", name: "Должник", description: "Долг: $20,000" },
];

export function MultiplayerLobby() {
  const router = useRouter();
  const { initializeGame } = useGameStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedArchetype, setSelectedArchetypeLocal] = useState<CharacterArchetype | null>(null);
  const [playerName, setPlayerNameLocal] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    // Получаем room из URL
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get("room");

    if (!room) {
      // Если нет room, создаем новый
      const newRoomId = initMultiplayer(undefined, true);
      setRoomId(newRoomId);
    } else {
      setRoomId(room);
      initMultiplayer(room, false);
    }

    // Обновляем список игроков
    const updatePlayers = () => {
      setPlayers(getOnlinePlayers());
    };

    const interval = setInterval(updatePlayers, 500);
    updatePlayers();

    // Подписываемся на старт игры
    const unsubscribeGameStart = subscribeToGameStart(() => {
      // Хост запустил игру - начинаем
      const myPlayer = getOnlinePlayers().find(p => p.isLocal);
      if (myPlayer?.selectedArchetype) {
        initializeGame("", myPlayer.selectedArchetype as CharacterArchetype);
        router.push("/");
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribeGameStart();
    };
  }, [initializeGame, router]);

  const handleSelectArchetype = (archetype: CharacterArchetype) => {
    setSelectedArchetypeLocal(archetype);
    setSelectedArchetype(archetype);
  };

  const handleSaveName = () => {
    if (playerName.trim()) {
      setPlayerName(playerName.trim());
      setIsEditingName(false);
    }
  };

  const handleStartGame = () => {
    if (!isHost()) return;

    // Проверяем что все выбрали персонажей
    const allSelected = players.every(p => p.selectedArchetype);
    if (!allSelected) {
      alert("Не все игроки выбрали персонажа!");
      return;
    }

    // Запускаем игру
    startGame();

    // Инициализируем свою игру
    const myPlayer = players.find(p => p.isLocal);
    if (myPlayer?.selectedArchetype) {
      initializeGame("", myPlayer.selectedArchetype as CharacterArchetype);
      router.push("/");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Ссылка скопирована!");
  };

  const canStart = isHost() && players.every(p => p.selectedArchetype) && players.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Лобби мультиплеера
          </h1>
          <p className="text-white/60 text-lg">
            Комната: <span className="font-mono text-white">{roomId}</span>
          </p>
          <Button
            onClick={copyLink}
            variant="outline"
            className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Скопировать ссылку
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Список игроков */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">
                Игроки ({players.length})
              </h2>
            </div>

            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.clientId}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="text-white font-medium">
                        {player.name}
                        {player.isLocal && <span className="text-white/40 ml-2">(вы)</span>}
                      </span>
                      {player.isHost && (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    {player.selectedArchetype ? (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">
                          {ARCHETYPES.find(a => a.id === player.selectedArchetype)?.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-white/40 text-sm">Выбирает...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isHost() && (
              <Button
                onClick={handleStartGame}
                disabled={!canStart}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                <Play className="w-5 h-5 mr-2" />
                Начать игру
              </Button>
            )}
          </div>

          {/* Выбор персонажа */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">
              Выберите персонажа
            </h2>

            <div className="space-y-3">
              {ARCHETYPES.map((archetype) => (
                <button
                  key={archetype.id}
                  onClick={() => handleSelectArchetype(archetype.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedArchetype === archetype.id
                    ? "bg-purple-600/30 border-purple-400"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {archetype.name}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {archetype.description}
                      </p>
                    </div>
                    {selectedArchetype === archetype.id && (
                      <Check className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {!isHost() && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <strong>Ожидание хоста...</strong> Хост запустит игру когда все будут готовы.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
