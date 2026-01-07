'use client'

import React from 'react'
import { Target } from 'lucide-react'

import { GoalCard } from './goal-card'
import { LifestyleSection } from './lifestyle-section'
import { TraitsSection } from './traits-section'
import type { FamilyMember, LifeGoal, Player } from '@/core/types'
import { DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

interface MemberDisplayData {
  id: string
  name: string
  type: FamilyMember['type'] | 'player'
  age: number
  goals: LifeGoal[]
  foodPreference?: string
  transportPreference?: string
}

interface MemberDetailsDialogProps {
  member?: FamilyMember
  isPlayer: boolean
  player: Player
  displayData: MemberDisplayData
  getTypeLabel: () => string
  getIcon: () => React.ReactNode
}

type TabType = 'overview' | 'lifestyle' | 'goals'

export function MemberDetailsDialog({
  member,
  isPlayer,
  player,
  displayData,
  getTypeLabel,
  getIcon,
}: MemberDetailsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>('overview')

  return (
    <DialogContent className="max-w-2xl bg-[#0f1115] border-white/10 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
              isPlayer ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10'
            }`}
          >
            {getIcon()}
          </div>
          <div>
            <DialogTitle className="text-2xl font-black text-white">{displayData.name}</DialogTitle>
            <p className="text-white/50 font-medium">
              {getTypeLabel()} • {displayData.age} лет
            </p>
          </div>
        </div>
      </DialogHeader>

      <div className="mt-6">
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl mb-6">
          {(['overview', 'lifestyle', 'goals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab === 'overview' ? 'Обзор' : tab === 'lifestyle' ? 'Образ жизни' : 'Цели'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <TraitsSection player={isPlayer ? player : member || { traits: [] }} />
          </div>
        )}

        {activeTab === 'lifestyle' && (
          <div>
            <LifestyleSection member={member} isPlayer={isPlayer} displayData={displayData} />
          </div>
        )}

        {activeTab === 'goals' && (
          <div>
            <section>
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                Жизненные цели
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayData.goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </DialogContent>
  )
}
