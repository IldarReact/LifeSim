'use client'

import { Briefcase } from 'lucide-react'
import React from 'react'

import { useGameStore } from '@/core/model/store'
import { cn } from '@/shared/utils/utils'

export function WorkIndicator() {
  const { businessProposals, offers, player, setActiveActivity } = useGameStore()

  if (!player) return null

  // Подсчёт входящих предложений по бизнесу (внутреннее голосование)
  const pendingProposalsCount = businessProposals.filter(
    (p) => p.status === 'pending' && p.initiatorId !== player.id,
  ).length

  // Подсчёт входящих игровых офферов (от других игроков/системы)
  const incomingOffersCount = offers.filter(
    (o) => o.status === 'pending' && o.toPlayerId === player.id,
  ).length

  const totalNotificationsCount = pendingProposalsCount + incomingOffersCount

  const handleClick = () => {
    setActiveActivity('work')
  }

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        className={cn(
          'relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 flex flex-col items-center gap-0.5 min-w-[50px]',
          totalNotificationsCount > 0 &&
            'text-amber-400 hover:text-amber-300 bg-amber-500/5 border border-amber-500/20',
        )}
        title="Работа и бизнес"
      >
        <Briefcase className={cn('w-5 h-5', totalNotificationsCount > 0 && 'animate-pulse')} />
        <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70">Работа</span>

        {totalNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-linear-to-br from-orange-500 to-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-zinc-950 shadow-lg animate-bounce">
            {totalNotificationsCount > 9 ? '9+' : totalNotificationsCount}
          </span>
        )}
      </button>
    </div>
  )
}
