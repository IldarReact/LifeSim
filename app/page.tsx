"use client"

import { TopStatusBar } from "@/shared/ui/top-bar/top-status-bar"
import { GameEnd } from "@/features/end/ui"
import { WorldSelect } from "@/features/setup/components"
import { CharacterSelect } from "@/features/setup/components"
import { ActivityNavigation, ActivityContent } from "@/features/gameplay/ui"
import { EventModal } from "@/features/events/event-modal"
import { MultiplayerHud } from "@/features/multiplayer/MultiplayerHub"
import { useGameStore } from "@/core/model/store"

// Утилита для очистки сохранений (доступна в консоли браузера)
import "@/core/lib/persistence/clear-saves"


import { MainMenu } from "@/features/menu/main-menu"

import { OffersList } from "@/features/notifications/offers-list"
import { useOffersSync } from "@/features/multiplayer/use-offers-sync"

export default function Page() {
  const { gameStatus } = useGameStore()

  // Sync offers (multiplayer)
  useOffersSync()

  // Main Menu
  if (gameStatus === "menu") {
    return <MainMenu />
  }

  // Setup Phase
  if (gameStatus === "setup") {
    return <WorldSelect />
  }

  if (gameStatus === "select_character") {
    return <CharacterSelect />
  }

  // Game End
  if (gameStatus === "ended") {
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
