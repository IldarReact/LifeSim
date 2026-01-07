'use client'

import {
  Heart,
  Briefcase,
  TrendingUp,
  Landmark,
  Home,
  Palmtree,
  Bell,
  GraduationCap,
  ShoppingCart,
} from 'lucide-react'
import React from 'react'

import { useGameStore } from '@/core/model/store'
import type { GameState } from '@/core/types'

type ActivityId = NonNullable<GameState['activeActivity']> | 'education'

interface Activity {
  id: ActivityId
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const ACTIVITIES: readonly Activity[] = [
  { id: 'shop', label: 'МАГАЗИН', icon: ShoppingCart, description: 'Товары и услуги' },
  { id: 'family', label: 'СЕМЬЯ', icon: Heart, description: 'Семья и отношения' },
  { id: 'work', label: 'РАБОТА', icon: Briefcase, description: 'Карьера и доход' },
  { id: 'education', label: 'ОБУЧЕНИЕ', icon: GraduationCap, description: 'Образование и навыки' },
  { id: 'investments', label: 'ИНВЕСТИЦИИ', icon: TrendingUp, description: 'Акции и активы' },
  { id: 'banking', label: 'БАНКИ', icon: Landmark, description: 'Кредиты и депозиты' },
  { id: 'relocation', label: 'ПЕРЕЕЗД', icon: Home, description: 'Жилище и имущество' },
  { id: 'leisure', label: 'ОТДЫХ', icon: Palmtree, description: 'Развлечения и здоровье' },
  { id: 'events', label: 'СОБЫТИЯ', icon: Bell, description: 'История событий' },
]

export function ActivityNavigation(): React.JSX.Element | null {
  const { activeActivity, setActiveActivity, gameStatus, player, businessProposals, offers } =
    useGameStore()

  // Подсчёт входящих уведомлений для раздела "Работа"
  const workNotificationsCount = React.useMemo(() => {
    if (!player) return 0

    const pendingProposalsCount = businessProposals.filter(
      (p) => p.status === 'pending' && p.initiatorId !== player.id,
    ).length

    const incomingOffersCount = (offers || []).filter(
      (o) => o.status === 'pending' && o.toPlayerId === player.id,
    ).length

    return pendingProposalsCount + incomingOffersCount
  }, [businessProposals, offers, player])

  if (gameStatus !== 'playing') return null

  const getNotificationCount = (activityId: ActivityId): number => {
    if (activityId === 'work') {
      return workNotificationsCount
    }
    return 0
  }

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
      <div className="bg-white/10 backdrop-blur-md border border-black/30 rounded-r-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] pointer-events-auto">
        <div className="flex flex-col gap-2 py-4">
          {ACTIVITIES.map((activity) => {
            const Icon = activity.icon
            const isActive = activeActivity === activity.id
            const notificationCount = getNotificationCount(activity.id)

            return (
              <button
                key={activity.id}
                onClick={() => setActiveActivity(activity.id)}
                className={`w-16 md:w-20 py-4 px-1 flex flex-col items-center gap-1.5 transition-all relative group ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
                title={activity.description}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] rounded-r-full" />
                )}

                {/* Notification Badge */}
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-linear-to-br from-orange-500 to-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border border-white/20 animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </div>
                )}

                <Icon
                  className={`w-5 h-5 md:w-6 md:h-6 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                <span className="text-[10px] font-bold tracking-wider text-center leading-tight opacity-80">
                  {activity.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
