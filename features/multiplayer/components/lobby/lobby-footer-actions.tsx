'use client'

import { Play } from 'lucide-react'

import { Button } from '@/shared/ui/button'

interface LobbyFooterActionsProps {
  isReady: boolean
  canReady: boolean
  canStart: boolean
  onToggleReady: () => void
  onStartGame: () => void
}

export function LobbyFooterActions({
  isReady,
  canReady,
  canStart,
  onToggleReady,
  onStartGame,
}: LobbyFooterActionsProps) {
  return (
    <div className="space-y-3">
      <Button
        onClick={onToggleReady}
        disabled={!canReady}
        className={`w-full h-12 text-base font-medium transition-all ${
          isReady
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
        }`}
      >
        {isReady ? 'Вы готовы' : 'Готов к игре'}
      </Button>

      {canStart && (
        <Button
          onClick={onStartGame}
          className={`w-full h-14 text-lg font-bold shadow-lg transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/20 animate-pulse`}
        >
          <Play className="w-5 h-5 mr-2" />
          Начать игру
        </Button>
      )}
    </div>
  )
}
