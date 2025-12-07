"use client"

import { useGameStore } from "@/core/model/game-store"
import { WorldSelect, CharacterSelect } from "@/features/setup/ui"
import { GameEnd } from "@/features/end/ui"
import { TopStatusBar } from "@/shared/ui/top-bar/top-status-bar"
import { ActivityNavigation, ActivityContent } from "@/features/gameplay/ui"
import { EventModal } from "@/features/events/event-modal"
import type { GameStatus } from "@/core/types"

const GameplayScreen = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <TopStatusBar />
    <div className="flex flex-1 overflow-hidden">
      <ActivityNavigation />
      <div className="flex-1 overflow-auto">
        <ActivityContent />
      </div>
    </div>
    <EventModal />
  </div>
)

const GameEndScreenWrapper = () => (
  <div className="min-h-screen bg-background">
    <GameEnd />
  </div>
)

import { MainMenu } from "@/features/menu/main-menu"

const SCREENS: Record<GameStatus, React.ComponentType> = {
  menu: MainMenu,
  setup: WorldSelect,
  select_country: WorldSelect, // Alias keeping consistent with setup
  select_character: CharacterSelect,
  playing: GameplayScreen,
  ended: GameEndScreenWrapper,
}

export function GameBoard() {
  const { gameStatus } = useGameStore()

  const Screen = SCREENS[gameStatus]

  if (!Screen) return null

  return <Screen />
}
