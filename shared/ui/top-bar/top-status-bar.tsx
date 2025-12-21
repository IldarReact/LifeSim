'use client'

import { AlertDialogDescription } from '@radix-ui/react-alert-dialog'
import {
  LogOut,
} from 'lucide-react'
import React from 'react'


import { EnergyIndicator } from './energy-indicator'
import { HappinessIndicator } from './happiness-indicator'
import { HealthIndicator } from './health-indicator'
import { IntelligenceIndicator } from './intelligence-indicator'
import { MoneyIndicator } from './money-indicator'
import { NotificationsMenu } from './notifications-menu'
import { SanityIndicator } from './sanity-indicator'


import { getQuarter } from '@/core/lib/quarter'
import { useGameStore } from '@/core/model/game-store'
import { MultiplayerHud } from '@/features/multiplayer/multiplayer-hub'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { calculateStatModifiers, getTotalModifier } from '@/core/lib/calculations/stat-modifiers'
import { processLifestyle } from '@/core/model/logic/turns/lifestyle-processor'

export function TopStatusBar() {
  const { player, turn, year, resetGame, countries } = useGameStore()

  if (!player) return null

  const currentCountry = countries[player.countryId]
  const statMods = calculateStatModifiers(player)
  const lifestyleResult = processLifestyle(player, countries)
  const deltas = {
    happiness:
      getTotalModifier(statMods.happiness, 'happiness') +
      (lifestyleResult.modifiers.happiness || 0),
    energy:
      getTotalModifier(statMods.energy, 'energy') + (lifestyleResult.modifiers.energy || 0),
    health:
      getTotalModifier(statMods.health, 'health') + (lifestyleResult.modifiers.health || 0),
    sanity:
      getTotalModifier(statMods.sanity, 'sanity') + (lifestyleResult.modifiers.sanity || 0),
    intelligence:
      getTotalModifier(statMods.intelligence, 'intelligence') +
      (lifestyleResult.modifiers.intelligence || 0),
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2 md:px-6 md:py-3">
      <div className="mx-auto max-w-7xl">
        <div className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-2 shadow-2xl backdrop-blur-xl transition-all md:px-6">
          {/* Left: Country */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Страна
              </span>
              <span className="text-lg font-bold text-white">{currentCountry?.name || 'N/A'}</span>
            </div>
          </div>

          {/* Center: Player Stats */}
          <div className="hidden lg:flex items-center gap-4">
            <MoneyIndicator />
            <div className="h-8 w-1px bg-white/10" />
            <HappinessIndicator />
            <div className="h-8 w-1px bg-white/10" />
            <EnergyIndicator />
            <div className="h-8 w-1px bg-white/10" />
            <HealthIndicator />
            <div className="h-8 w-1px bg-white/10" />
            <SanityIndicator />
            <div className="h-8 w-1px bg-white/10" />
            <IntelligenceIndicator />
          </div>
          <div className="hidden lg:flex items-center gap-3 absolute left-1/2 -translate-x-1/2 -bottom-5">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                deltas.happiness >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              Радость {deltas.happiness > 0 ? '+' : ''}{deltas.happiness}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                deltas.energy >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              Энергия {deltas.energy > 0 ? '+' : ''}{deltas.energy}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                deltas.health >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              Здоровье {deltas.health > 0 ? '+' : ''}{deltas.health}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                deltas.sanity >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              Рассудок {deltas.sanity > 0 ? '+' : ''}{deltas.sanity}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                deltas.intelligence >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              Интеллект {deltas.intelligence > 0 ? '+' : ''}{deltas.intelligence}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <NotificationsMenu />

            <div className="h-8 w-1px bg-white/10" />

            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Дата
              </span>
              <span className="text-lg font-bold text-white tabular-nums">
                {year} Q{getQuarter(turn)}
              </span>
            </div>

            <div className="h-8 w-1px bg-white/10" />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/50 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Закончить игру?</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/70">
                    Весь прогресс будет потерян. Вы уверены, что хотите выйти в главное меню?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10 hover:text-white">
                    Отмена
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetGame}
                    className="bg-rose-600 text-white hover:bg-rose-700 border-none"
                  >
                    Закончить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* HUD показывается только когда есть комната */}
      <MultiplayerHud />
    </div>
  )
}
