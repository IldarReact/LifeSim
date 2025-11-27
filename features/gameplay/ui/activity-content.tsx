"use client"

import React, { useEffect, useState } from "react"
import { useGameStore } from "@/core/model/game-store"
import { FamilyActivity } from "@/features/activities/family-activity"
import { WorkActivity } from "@/features/activities/work/work-activity"
import { InvestmentsActivity } from "@/features/activities/investments-activity"
import { BanksActivity } from "@/features/activities/banks-activity"
import { RelocationActivity } from "@/features/activities/relocation-activity"
import { RestActivity } from "@/features/activities/rest-activity"
import { EventsActivity } from "@/features/activities/events-activity"
import { EducationActivity } from "@/features/activities/education-activity"
import { Button } from "@/shared/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import type { GameState } from "@/core/types"
import {
  isMultiplayerActive,
  setPlayerReady,
  subscribeToReadyStatus,
  syncTurnAdvance,
  triggerTurnAdvance
} from "@/core/lib/multiplayer"

// Helper type to exclude null from keys
type ActivityType = NonNullable<GameState["activeActivity"]> | "education"

const backgroundImages: Record<ActivityType, string> = {
  family: "url('https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=800&fit=crop')",
  work: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop')",
  education: "url('https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=800&fit=crop')",
  investments: "url('https://images.unsplash.com/photo-1611974588547-b06c3f1b0b6f?w=1200&h=800&fit=crop')",
  banks: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop')",
  relocation: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop')",
  rest: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop')",
  events: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop')",
}

export function ActivityContent(): React.JSX.Element | null {
  const { activeActivity, nextTurn, isProcessingTurn, gameStatus, player } = useGameStore()

  // Multiplayer state
  const [readyStats, setReadyStats] = useState({ ready: 0, total: 1, allReady: false })
  const [localIsReady, setLocalIsReady] = useState(false)

  // Подписка на статус готовности
  useEffect(() => {
    if (!isMultiplayerActive()) return

    const unsubscribe = subscribeToReadyStatus((ready, total, allReady) => {
      setReadyStats({ ready, total, allReady })

      // Если все готовы и мы тоже - триггерим переход хода
      if (allReady && localIsReady) {
        triggerTurnAdvance()
      }
    })

    return () => unsubscribe()
  }, [localIsReady])

  // Подписка на синхронизацию хода
  useEffect(() => {
    if (!isMultiplayerActive()) return

    const unsubscribe = syncTurnAdvance(() => {
      // Все игроки переходят ход одновременно
      nextTurn()

      // Сбрасываем статус готовности
      setPlayerReady(false)
      setLocalIsReady(false)
    })

    return () => unsubscribe()
  }, [nextTurn])

  if (gameStatus !== "playing" || !player) return null

  const currentActivity = (activeActivity || "family") as ActivityType

  const handleTurnClick = () => {
    const isMultiplayer = isMultiplayerActive()

    if (isMultiplayer && readyStats.total > 1) {
      // Мультиплеер: переключаем статус готовности
      const newReadyState = !localIsReady
      setLocalIsReady(newReadyState)
      setPlayerReady(newReadyState)
    } else {
      // Одиночная игра: сразу переходим ход
      nextTurn()
    }
  }

  const isWaiting = isMultiplayerActive() && readyStats.total > 1 && localIsReady

  return (
    <div className="relative min-h-screen pt-24">
      <div
        className="fixed inset-0 bg-cover bg-center blur-md brightness-40"
        style={{
          backgroundImage: backgroundImages[currentActivity] || backgroundImages.family,
          zIndex: 0,
        }}
      />

      <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto pb-24 sm:pb-32">
        {currentActivity === "family" && <FamilyActivity />}
        {currentActivity === "work" && <WorkActivity />}
        {currentActivity === "education" && <EducationActivity />}
        {currentActivity === "investments" && <InvestmentsActivity />}
        {currentActivity === "banks" && <BanksActivity />}
        {currentActivity === "relocation" && <RelocationActivity />}
        {currentActivity === "rest" && <RestActivity />}
        {currentActivity === "events" && <EventsActivity />}
      </div>

      <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50">
        <Button
          size="lg"
          onClick={handleTurnClick}
          disabled={isProcessingTurn}
          className={`
            px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 
            text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl
            flex items-center gap-2 sm:gap-3 group backdrop-blur-md
            transition-all shadow-2xl
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isWaiting
              ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
              : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            }
          `}
        >
          {isProcessingTurn ? (
            <>
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              <span className="hidden sm:inline">Обработка...</span>
            </>
          ) : isWaiting ? (
            <>
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white/70" />
              <span className="hidden sm:inline">Ожидание ({readyStats.ready}/{readyStats.total})</span>
              <span className="sm:hidden">{readyStats.ready}/{readyStats.total}</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Завершить ход</span>
              <span className="sm:hidden">Ход</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
