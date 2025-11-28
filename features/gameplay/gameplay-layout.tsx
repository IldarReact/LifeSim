"use client"

import { useState, useEffect } from "react"
import { useGameStore } from "@/core/model/game-store"
import { WorldMapCard } from "./world-map-card"
import { ActivitiesPanel } from "./activities-panel"
import { Button } from "@/shared/ui/button"
import { isMultiplayerActive, setTurnReady, subscribeToTurnReadyStatus } from "@/core/lib/multiplayer"
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

  // Подписка на готовность всех игроков
  useEffect(() => {
    if (!isMultiplayerActive() || !isTurnLocked) return

    const unsubscribe = subscribeToTurnReadyStatus((ready, total, allReady) => {
      // Если все готовы - переходим ход
      if (allReady) {
        handleAllPlayersReady()
      }
    })

    return () => unsubscribe()
  }, [isTurnLocked])

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

    // Переходим ход
    nextTurn()
  }

  const handleClick = (e: React.MouseEvent) => {
    // Если ход заблокирован и клик не на кнопку отмены
    if (isTurnLocked && !(e.target as HTMLElement).closest('[data-allow-when-locked]')) {
      e.stopPropagation()
      setShowLockedModal(true)
    }
  }

  return (
    <>
      <div
        className="max-w-7xl mx-auto px-6 py-8"
        onClick={handleClick}
        style={{ pointerEvents: isTurnLocked ? 'auto' : 'auto' }}
      >
        {/* Оверлей блокировки */}
        {isTurnLocked && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation()
              setShowLockedModal(true)
            }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-1">
            <WorldMapCard country={countries[player.countryId]} />
          </div>

          <div className="lg:col-span-2">
            <ActivitiesPanel />
          </div>
        </div>

        <div className="mt-8 flex justify-center relative z-10">
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
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Ожидание других игроков...
              </>
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
