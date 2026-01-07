'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { LobbyFooterActions } from './components/lobby/lobby-footer-actions'
import { LobbyHeader } from './components/lobby/lobby-header'
import { LobbyInfoBlock } from './components/lobby/lobby-info-block'
import { LobbySettings } from './components/lobby/lobby-settings'
import { PlayerList } from './components/lobby/player-list'
import { Player } from './multiplayer-hub'

import { getCharactersForCountry } from '@/core/lib/data-loaders/characters-loader'
import {
  getOnlinePlayers,
  setSelectedArchetype,
  startGame,
  subscribeToGameStart,
  isHost,
  initMultiplayer,
  setPlayerReady,
} from '@/core/lib/multiplayer'
import { useGameStore } from '@/core/model/store'
import type { CountryEconomy } from '@/core/types'
import { CharacterSelectUI } from '@/features/setup/components/character-select'
import { WorldSelectUI } from '@/features/setup/components/world-select'

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
        <LobbyHeader roomId={roomId} onCopyLink={copyLink} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <PlayerList players={players} />
            <LobbyFooterActions
              isReady={isReady}
              canReady={canReady}
              canStart={canStart}
              onToggleReady={handleToggleReady}
              onStartGame={handleStartGame}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <LobbySettings
              selectedCountryName={selectedCountryName}
              selectedArchetypeName={selectedArchetypeName}
              selectedArchetype={selectedArchetype}
              onOpenCountryModal={() => setIsCountryModalOpen(true)}
              onOpenArchetypeModal={() => setIsArchetypeModalOpen(true)}
            />
            <LobbyInfoBlock />
          </div>
        </div>
      </div>
    </div>
  )
}
