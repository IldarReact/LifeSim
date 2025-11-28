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
import { Users, Crown, Play, Link as LinkIcon, Check, AlertCircle, Globe, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { ExpandableCard } from "@/shared/ui/expandable-card";
import type { CountryEconomy } from "@/core/types";

type Player = {
  clientId: number;
  name: string;
  color: string;
  isHost: boolean;
  isReady: boolean;
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
  const { initializeGame, countries } = useGameStore();
  const countryList: CountryEconomy[] = Object.values(countries);

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedArchetype, setSelectedArchetypeLocal] = useState<CharacterArchetype | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("usa");
  const [roomId, setRoomId] = useState("");
  const [isReady, setIsReady] = useState(false);

  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get("room");

    if (!room) {
      const newRoomId = initMultiplayer(undefined, true);
      setRoomId(newRoomId);
    } else {
      setRoomId(room);
      initMultiplayer(room, false);
    }

    const updatePlayers = () => {
      setPlayers(getOnlinePlayers());
    };

    const interval = setInterval(updatePlayers, 500);
    updatePlayers();

    const unsubscribeGameStart = subscribeToGameStart(() => {
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
    setIsArchetypeModalOpen(false);
  };

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId);
    setIsCountryModalOpen(false);
  };

  const handleToggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    setPlayerReady(newReadyState);
  };

  const handleStartGame = () => {
    if (!isHost()) return;
    const allReady = players.every(p => p.isReady && p.selectedArchetype);
    if (!allReady) {
      alert("Не все игроки готовы!");
      return;
    }
    startGame();
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

  const selectedCountryName = countryList.find(c => c.id === selectedCountry)?.name || "Не выбрано";
  const selectedArchetypeName = ARCHETYPES.find(a => a.id === selectedArchetype)?.name || "Не выбрано";

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-200 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Лобби</h1>
            <p className="text-slate-500 text-sm">
              Комната: <span className="font-mono text-slate-300">{roomId}</span>
            </p>
          </div>
          <Button
            onClick={copyLink}
            variant="outline"
            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Пригласить
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка: Игроки */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-slate-400" />
                <h2 className="text-xl font-semibold text-white">Игроки ({players.length})</h2>
              </div>

              <div className="space-y-3">
                {players.map((player) => (
                  <div
                    key={player.clientId}
                    className="bg-slate-950/50 rounded-lg p-4 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shadow-[0_0_10px]"
                        style={{ backgroundColor: player.color, boxShadow: `0 0 10px ${player.color}` }}
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-200">
                          {player.name}
                          {player.isLocal && <span className="text-slate-500 ml-2">(вы)</span>}
                        </div>
                        {player.isHost && (
                          <div className="flex items-center gap-1 mt-1">
                            <Crown className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Хост</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {player.isReady ? (
                      <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-xs font-medium">
                        <Check className="w-3 h-3" /> Готов
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-500 bg-slate-800/50 px-2 py-1 rounded text-xs font-medium">
                        <AlertCircle className="w-3 h-3" /> Ожидание
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Действия */}
            <div className="space-y-3">
              {!isHost() && (
                <Button
                  onClick={handleToggleReady}
                  disabled={!canReady}
                  className={`w-full h-12 text-base font-medium transition-all ${isReady
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                >
                  {isReady ? "Вы готовы" : "Готов к игре"}
                </Button>
              )}

              {isHost() && (
                <Button
                  onClick={handleStartGame}
                  disabled={!canStart}
                  className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Начать игру
                </Button>
              )}
            </div>
          </div>

          {/* Правая колонка: Настройки */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Карточка выбора страны */}
              <div
                onClick={() => setIsCountryModalOpen(true)}
                className="bg-slate-900 rounded-xl p-6 border border-slate-800 cursor-pointer hover:border-slate-600 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                      <Globe className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Страна</h3>
                      <p className="text-lg font-bold text-white">{selectedCountryName}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 group-hover:text-white">
                    Изменить
                  </Button>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-full" />
                </div>
              </div>

              {/* Карточка выбора персонажа */}
              <div
                onClick={() => setIsArchetypeModalOpen(true)}
                className="bg-slate-900 rounded-xl p-6 border border-slate-800 cursor-pointer hover:border-slate-600 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                      <User className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Персонаж</h3>
                      <p className="text-lg font-bold text-white">{selectedArchetypeName}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 group-hover:text-white">
                    Изменить
                  </Button>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full w-full transition-all ${selectedArchetype ? 'bg-purple-500' : 'bg-transparent'}`} />
                </div>
              </div>
            </div>

            {/* Инфо-блок */}
            <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 text-center">
              <h3 className="text-lg font-medium text-white mb-2">Ожидание игроков</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Выберите страну и персонажа, затем нажмите "Готов". Игра начнется, когда хост запустит сессию.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Модалка выбора страны */}
      <Dialog open={isCountryModalOpen} onOpenChange={setIsCountryModalOpen}>
        <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 text-slate-200 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white mb-4">Выберите страну</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {countryList.map((country: CountryEconomy) => (
              <ExpandableCard
                key={country.id}
                title={country.name}
                description={`${country.archetype.replace(/_/g, " ")}`}
                image={`/placeholder.svg?height=120&width=120&query=flag+${country.name}`}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">GDP Growth</p>
                      <p className="font-semibold text-white">{country.gdpGrowth}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Inflation</p>
                      <p className="font-semibold text-white">{country.inflation}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Interest Rate</p>
                      <p className="font-semibold text-white">{country.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tax Rate</p>
                      <p className="font-semibold text-white">{country.taxRate}%</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCountrySelect(country.id)}
                    className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-semibold border border-slate-700"
                  >
                    Выбрать {country.name}
                  </button>
                </div>
              </ExpandableCard>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Модалка выбора персонажа */}
      <Dialog open={isArchetypeModalOpen} onOpenChange={setIsArchetypeModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white mb-4">Выберите персонажа</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {ARCHETYPES.map((archetype) => (
              <button
                key={archetype.id}
                onClick={() => handleArchetypeSelect(archetype.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedArchetype === archetype.id
                    ? "bg-slate-800 border-slate-600"
                    : "bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {archetype.name}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {archetype.description}
                    </p>
                  </div>
                  {selectedArchetype === archetype.id && (
                    <Check className="w-6 h-6 text-emerald-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
