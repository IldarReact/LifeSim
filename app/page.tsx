'use client'

import { TopStatusBar } from '@/shared/ui/top-bar/top-status-bar'
import { MultiplayerHud } from '@/features/multiplayer/multiplayer-hub'
import { useGameStore } from '@/core/model/store'
import { GameEnd } from '@/features/end/ui'
import { EventModal } from '@/features/events/event-modal'
import { ActivityNavigation, ActivityContent } from '@/features/gameplay/ui'

// Утилита для очистки сохранений (доступна в консоли браузера)
import '@/core/lib/persistence/clear-saves'

import { MainMenu } from '@/features/menu/main-menu'
import { useOffersSync } from '@/features/multiplayer/use-offers-sync'
import { OffersList } from '@/features/notifications/offers-list'
import { CharacterSelect } from '@/features/setup/components'
import { WorldSelect } from '@/features/setup/components'

export default function Page() {
  const { gameStatus } = useGameStore()

  // Sync offers (multiplayer)
  useOffersSync()

  // Main Menu
  if (gameStatus === 'menu') {
    return <MainMenu />
  }

  // Setup Phase
  if (gameStatus === 'setup') {
    return <WorldSelect />
  }

  if (gameStatus === 'select_character') {
    return <CharacterSelect />
  }

  // Game End
  if (gameStatus === 'ended') {
    return (
      <div className="min-h-screen bg-background">
        <GameEnd />
      </div>
    )
  }

  // Main Gameplay
  return (
    <div className="min-h-screen flex flex-col">
      <TopStatusBar />
      <div className="flex flex-1 overflow-hidden">
        <ActivityNavigation />
        <div className="flex-1 overflow-auto">
          <ActivityContent />
        </div>
      </div>
      <EventModal />

      {/* Notifications & Overlays */}
      <OffersList />

      {/* Multiplayer */}
      <MultiplayerHud />
    </div>
  )
}
