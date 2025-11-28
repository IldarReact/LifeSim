"use client"

import { useState } from "react"
import { useGameStore } from "@/core/model/game-store"
import { WorldMapCard } from "./world-map-card"
import { ActivitiesPanel } from "./activities-panel"
import { Button } from "@/shared/ui/button"
import { isMultiplayerActive, setTurnReady, triggerTurnAdvance } from "@/core/lib/multiplayer"
import { TurnSyncModal } from "@/features/multiplayer/turn-sync-modal"
import { TurnLockedModal } from "@/features/multiplayer/turn-locked-modal"
import { Loader2 } from "lucide-react"

export function GameplayLayout() {
  const {
    gameStatus,
    turn,
    player,
    countries,
    nextTurn,
    isProcessingTurn,
  } = useGameStore()

  const [isTurnSyncOpen, setIsTurnSyncOpen] = useState(false)
  const [isTurnLocked, setIsTurnLocked] = useState(false)
  const [showLockedModal, setShowLockedModal] = useState(false)

  if (!player || gameStatus !== "playing") return null

  const handleNextTurn = () => {
    const isMultiplayer = isMultiplayerActive()

    if (isMultiplayer) {
      // В мультиплеере: отмечаем себя готовым и показываем модалку ожидания
      setTurnReady(true)
      setIsTurnLocked(true)
      setIsTurnSyncOpen(true)
    } else {
      // В одиночной игре: просто переходим к следующему ходу
      nextTurn()
    }
  }

  const handleCancelTurnSync = () => {
    setTurnReady(false)
    setIsTurnLocked(false)
    setIsTurnSyncOpen(false)
  }

  const handleAllPlayersReady = () => {
    // Все игроки готовы - переходим к следующему ходу
    setIsTurnSyncOpen(false)
    setIsTurnLocked(false)
    setTurnReady(false)

    // Триггерим переход хода для всех
    triggerTurnAdvance()
    nextTurn()
  }

  const handleActionAttempt = () => {
    if (isTurnLocked) {
      setShowLockedModal(true)
    }
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8" onClick={handleActionAttempt}>
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
            onClick={handleNextTurn}
            disabled={isProcessingTurn || isTurnLocked}
            className="px-8 py-6 bg-white/5 border border-white/10 text-white text-lg font-semibold rounded-xl hover:bg-white/10 transition-all w-full max-w-md backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingTurn ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Обработка хода...
              </>
            ) : isTurnLocked ? (
              "Ожидание других игроков..."
            ) : (
              `ЗАВЕРШИТЬ ХОД (${turn}/40)`
            )}
          </Button>
        </div>
      </div>

      {/* Модалка синхронизации хода */}
      <TurnSyncModal
        isOpen={isTurnSyncOpen}
        onCancel={handleCancelTurnSync}
        onAllReady={handleAllPlayersReady}
      />

      {/* Модалка предупреждения о блокировке */}
      <TurnLockedModal
        isOpen={showLockedModal}
        onClose={() => setShowLockedModal(false)}
      />
    </>
  )
}
