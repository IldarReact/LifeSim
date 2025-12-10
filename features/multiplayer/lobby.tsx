'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import {
  getOnlinePlayers,
  setPlayerName,
  setSelectedArchetype,
  startGame,
  subscribeToGameStart,
  isHost,
  initMultiplayer,
  setPlayerReady,
} from '@/core/lib/multiplayer'
import { useGameStore } from '@/core/model/game-store'
import {
  Users,
  Crown,
  Play,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Globe,
  User,
} from 'lucide-react'
import { WorldSelectUI } from '@/features/setup/components/world-select'
import { CharacterSelectUI } from '@/features/setup/components/character-select'
import type { CountryEconomy } from '@/core/types'
import { Player } from './MultiplayerHub'
import { getCharactersForCountry } from '@/core/lib/data-loaders/characters-loader'

export function MultiplayerLobby() {
  const router = useRouter()
  const { initializeGame, countries } = useGameStore()
  const countryList: CountryEconomy[] = Object.values(countries)

  const [players, setPlayers] = useState<Player[]>([])
  const [selectedArchetype, setSelectedArchetypeLocal] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>('us')
  const [roomId, setRoomId] = useState('')
  const [isReady, setIsReady] = useState(false)

  const characters = getCharactersForCountry(selectedCountry)

  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false)
  const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const room = urlParams.get('room')

    if (!room) {
      router.push('/')
      return
    }

    setRoomId(room)
    const isStoredHost = sessionStorage.getItem(`life_sim_host_${room}`) === 'true'
    initMultiplayer(room, isStoredHost)

    const updatePlayerHost = () => {
      const currentPlayers = getOnlinePlayers()
      const amIHost = isHost()
      setPlayers(currentPlayers)
    }

    const interval = setInterval(updatePlayerHost, 6000)
    updatePlayerHost()

    const unsubscribeGameStart = subscribeToGameStart(() => {
      if (isHost()) return

      const myPlayer = getOnlinePlayers().find((p) => p.isLocal)
      if (myPlayer?.selectedArchetype) {
        initializeGame(selectedCountry, myPlayer.selectedArchetype)
        router.push('/')
      }
    })

    return () => {
      clearInterval(interval)
      unsubscribeGameStart()
    }
  }, [initializeGame, router, selectedCountry])

  const handleArchetypeSelect = (archetype: string) => {
    setSelectedArchetypeLocal(archetype)
    setSelectedArchetype(archetype)
    setIsArchetypeModalOpen(false)
  }

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId)
    setIsCountryModalOpen(false)
  }

  const handleToggleReady = () => {
    const newReadyState = !isReady
    setIsReady(newReadyState)
    setPlayerReady(newReadyState)
  }

  const handleStartGame = () => {
    const allReady = players.every((p) => p.isReady && p.selectedArchetype)
    if (!allReady) {
      alert("Не все готовы! Все игроки должны выбрать персонажа и нажать 'Готов'.")
      return
    }

    startGame()

    const myPlayer = players.find((p) => p.isLocal)
    if (myPlayer?.selectedArchetype) {
      initializeGame(selectedCountry, myPlayer.selectedArchetype)
      router.push('/')
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Ссылка скопирована!')
  }

  const canStart =
    isHost() && players.every((p) => p.isReady && p.selectedArchetype) && players.length > 0
  const canReady = selectedArchetype !== null

  const selectedCountryName =
    countryList.find((c) => c.id === selectedCountry)?.name || 'Не выбрано'
  const selectedArchetypeName =
    characters.find((c) => c.archetype === selectedArchetype)?.name || 'Не выбрано'

  if (isCountryModalOpen) {
    return (
      <WorldSelectUI
        countries={countryList}
        onSelect={handleCountrySelect}
        onBack={() => setIsCountryModalOpen(false)}
      />
    )
  }

  if (isArchetypeModalOpen) {
    return (
      <CharacterSelectUI
        setupCountryId={selectedCountry}
        onSelect={handleArchetypeSelect}
        onBack={() => setIsArchetypeModalOpen(false)}
      />
    )
  }

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
                          style={{
                            backgroundColor: player.color,
                            boxShadow: `0 0 10px ${player.color}`,
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-slate-200">
                            {player.name}
                            {player.isLocal && <span className="text-slate-500 ml-2">(вы)</span>}
                          </div>
                          {player.isHost && (
                            <div className="flex items-center gap-1 mt-1">
                              <Crown className="w-3 h-3 text-amber-500" />
                              <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">
                                Хост
                              </span>
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
                <Button
                  onClick={handleToggleReady}
                  disabled={!canReady}
                  className={`w-full h-12 text-base font-medium transition-all ${
                    isReady
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isReady ? 'Вы готовы' : 'Готов к игре'}
                </Button>

                <Button
                  onClick={handleStartGame}
                  className={`w-full h-14 text-lg font-bold shadow-lg transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/20 animate-pulse`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Начать игру
                </Button>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 group-hover:text-white"
                    >
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 group-hover:text-white"
                    >
                      Изменить
                    </Button>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full w-full transition-all ${selectedArchetype ? 'bg-purple-500' : 'bg-transparent'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Инфо-блок */}
              <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 text-center">
                <h3 className="text-lg font-medium text-white mb-2">Ожидание игроков</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Выберите страну и персонажа, затем нажмите "Готов". Игра начнется, когда хост
                  запустит сессию.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
