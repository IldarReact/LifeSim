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
  initMultiplayer,
  setPlayerReady
} from "@/core/lib/multiplayer";
import { useGameStore } from "@/core/model/game-store";
import type { CharacterArchetype } from "@/core/types/job.types";
import { Users, Crown, Play, Link as LinkIcon, Check, AlertCircle } from "lucide-react";

type Player = {
  clientId: number;
  name: string;
  color: string;
  isHost: boolean;
  isReady: boolean;
  selectedArchetype: string | null;
  isLocal: boolean;
};

export function MultiplayerLobby() {
  const router = useRouter();
  const { initializeGame } = useGameStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedArchetype, setSelectedArchetypeLocal] = useState<CharacterArchetype | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("usa");
  const [roomId, setRoomId] = useState("");
  const [isReady, setIsReady] = useState(false);

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
        initializeGame(selectedCountry, myPlayer.selectedArchetype as CharacterArchetype);
        router.push("/");
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribeGameStart();
    };
  }, [initializeGame, router, selectedCountry]);

  const handleArchetypeSelect = (archetype: CharacterArchetype) => {
    setSelectedArchetypeLocal(archetype);
    setSelectedArchetype(archetype);
  };

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId);
  };

  const handleToggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    setPlayerReady(newReadyState);
  };

  const handleStartGame = () => {
    if (!isHost()) return;

    // Проверяем что все выбрали персонажей и готовы
    const allReady = players.every(p => p.isReady && p.selectedArchetype);
    if (!allReady) {
      alert("Не все игроки готовы!");
      return;
    }

    // Запускаем игру
    startGame();

    // Инициализируем свою игру
    const myPlayer = players.find(p => p.isLocal);
    if (myPlayer?.selectedArchetype) {
      initializeGame(selectedCountry, myPlayer.selectedArchetype as CharacterArchetype);
      router.push("/");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Ссылка скопирована!");
  };

  const canStart = isHost() && players.every(p => p.isReady && p.selectedArchetype) && players.length > 0;
  const canReady = selectedArchetype !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Лобби мультиплеера
          </h1>
          <p className="text-white/60 text-lg mb-4">
            Комната: <span className="font-mono text-white">{roomId}</span>
          </p>
          <Button
            onClick={copyLink}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Скопировать ссылку
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Список игроков */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">
                  Игроки ({players.length})
                </h2>
              </div>

              <div className="space-y-3 mb-6">
                {players.map((player) => (
                  <div
                    key={player.clientId}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
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
                      {player.isReady ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-white/20" />
                      )}
                    </div>
                    {player.selectedArchetype && (
                      <div className="text-xs text-white/60 ml-7">
                        Персонаж выбран
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Кнопка готовности */}
              {!isHost() && (
                <Button
                  onClick={handleToggleReady}
                  disabled={!canReady}
                  className={`w-full mb-4 ${isReady
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-blue-600 hover:bg-blue-700"
                    } text-white disabled:opacity-50`}
                >
                  {isReady ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Готов
                    </>
                  ) : (
                    "Отметить готовность"
                  )}
                </Button>
              )}

              {/* Кнопка старта для хоста */}
              {isHost() && (
                <Button
                  onClick={handleStartGame}
                  disabled={!canStart}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Начать игру
                </Button>
              )}

              {!canReady && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-amber-200 text-xs">
                    Выберите персонажа и страну, чтобы отметить готовность
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Выбор страны и персонажа */}
          <div className="lg:col-span-2 space-y-6">
            {/* Инструкция */}
            <div className="bg-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20">
              <h3 className="text-lg font-bold text-blue-200 mb-2">
                Как играть в мультиплеере:
              </h3>
              <ol className="text-blue-100 text-sm space-y-2 list-decimal list-inside">
                <li>Выберите страну и персонажа ниже</li>
                <li>Нажмите "Готов" когда закончите выбор</li>
                <li>Дождитесь пока все игроки будут готовы</li>
                <li>Хост нажмет "Начать игру"</li>
              </ol>
            </div>

            {/* Встроенный выбор страны */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Выберите страну
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["usa", "china", "germany", "russia"].map((countryId) => (
                  <button
                    key={countryId}
                    onClick={() => handleCountrySelect(countryId)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${selectedCountry === countryId
                      ? "bg-purple-600/30 border-purple-400"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                  >
                    <h3 className="text-white font-bold text-lg capitalize">
                      {countryId === "usa" ? "США" :
                        countryId === "china" ? "Китай" :
                          countryId === "germany" ? "Германия" : "Россия"}
                    </h3>
                    {selectedCountry === countryId && (
                      <Check className="w-5 h-5 text-purple-400 mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Встроенный выбор персонажа */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Выберите персонажа
              </h2>
              <div className="space-y-3">
                {[
                  { id: "investor" as CharacterArchetype, name: "Инвестор", desc: "Начальный капитал: $50,000" },
                  { id: "specialist" as CharacterArchetype, name: "Специалист", desc: "Зарплата: $4,000/мес" },
                  { id: "entrepreneur" as CharacterArchetype, name: "Предприниматель", desc: "Бонус к бизнесу" },
                  { id: "worker" as CharacterArchetype, name: "Рабочий", desc: "Стабильный доход" },
                  { id: "indebted" as CharacterArchetype, name: "Должник", desc: "Долг: $20,000" },
                ].map((archetype) => (
                  <button
                    key={archetype.id}
                    onClick={() => handleArchetypeSelect(archetype.id)}
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
                          {archetype.desc}
                        </p>
                      </div>
                      {selectedArchetype === archetype.id && (
                        <Check className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
