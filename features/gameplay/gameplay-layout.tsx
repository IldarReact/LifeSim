'use client'

import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

import { ActivitiesPanel } from './activities-panel'
import { FinancialCrisisModal } from './financial-crisis-modal'
import { GameOverScreen } from './game-over-screen'
import { WorldMapCard } from './world-map-card'

import { isInFinancialCrisis } from '@/core/lib/financial-crisis'
import {
  isMultiplayerActive,
  setTurnReady,
  subscribeToTurnReadyStatus,
} from '@/core/lib/multiplayer'
import { useGameStore } from '@/core/model/store'
import { TurnLockedModal } from '@/features/multiplayer/turn-locked-modal'
import { TurnSyncModal } from '@/features/multiplayer/turn-sync-modal'
import { useOffersSync } from '@/features/multiplayer/use-offers-sync'
import { InflationNotification } from '@/features/notifications/inflation-notification'
import { OffersList } from '@/features/notifications/offers-list'
import { Button } from '@/shared/ui/button'

export function GameplayLayout() {
  const {
    gameStatus,
    turn,
    player,
    countries,
    nextTurn,
    isProcessingTurn,
    inflationNotification,
    clearInflationNotification,
  } = useGameStore()

  const [isTurnSyncOpen, setIsTurnSyncOpen] = useState(false)
  const [isTurnLocked, setIsTurnLocked] = useState(false)
  const [showLockedModal, setShowLockedModal] = useState(false)
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false)

  // Синхронизация офферов
  useOffersSync()

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

  // Разрешаем рендер при ended, чтобы показать интерфейс под модалкой Game Over
  if (!player || (gameStatus !== 'playing' && gameStatus !== 'ended')) return null

  const isCrisis = isInFinancialCrisis(player.stats.money)

  const handleNextTurn = () => {
    if (isCrisis) {
      setIsCrisisModalOpen(true)
      return
    }

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
      {/* Game Over экран */}
      {gameStatus === 'ended' && <GameOverScreen />}

      {/* Финансовый кризис - открывается по кнопке */}
      {isCrisisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <FinancialCrisisModal onClose={() => setIsCrisisModalOpen(false)} />
        </div>
      )}

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
            className={`px-8 py-6 text-lg font-semibold rounded-xl transition-all w-full max-w-md backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              isCrisis
                ? 'bg-red-500/20 border-red-500/50 text-red-100 hover:bg-red-500/30 animate-pulse'
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }`}
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
            ) : isCrisis ? (
              'УСТРАНИТЬ ДОЛГ'
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
      <TurnLockedModal isOpen={showLockedModal} onClose={() => setShowLockedModal(false)} />

      {/* Уведомление об инфляции */}
      <InflationNotification data={inflationNotification} onClose={clearInflationNotification} />

      {/* DEBUG */}
      {inflationNotification && (
        <div className="fixed bottom-4 left-4 p-3 bg-green-950 text-green-200 rounded text-xs z-50">
          DEBUG: Inflation {inflationNotification.inflationRate}%
        </div>
      )}

      {/* Список входящих предложений */}
      <OffersList />
    </>
  )
}
