"use client"

import { useGameStore } from "@/core/model/game-store"
import { WorldMapCard } from "./world-map-card"
import { ActivitiesPanel } from "./activities-panel"
import { Button } from "@/shared/ui/button"

export function GameplayLayout() {
  const {
    gameStatus,
    turn,
    player,
    countries,
    nextTurn,
  } = useGameStore()

  if (!player || gameStatus !== "playing") return null

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <WorldMapCard country={countries[player.countryId]} />
        </div>

        <div className="lg:col-span-2">
          <ActivitiesPanel />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={() => nextTurn()}
          className="px-8 py-6 bg-white/5 border border-white/10 text-white text-lg font-semibold rounded-xl hover:bg-white/10 transition-all w-full max-w-md backdrop-blur-sm"
        >
          ЗАВЕРШИТЬ ХОД ({turn}/40)
        </Button>
      </div>
    </div>
  )
}
