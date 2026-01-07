'use client'

import { Star, Target, Heart, Brain } from 'lucide-react'
import React from 'react'

import type { LifeGoal } from '@/core/types'
import { Progress } from '@/shared/ui/progress'

export function GoalCard({ goal }: { goal: LifeGoal }) {
  return (
    <div
      className={`bg-white/5 border ${goal.isCompleted ? 'border-green-500/30' : 'border-white/10'} rounded-xl p-4 relative overflow-hidden`}
    >
      {goal.isCompleted && (
        <div className="absolute top-0 right-0 bg-green-500/20 px-3 py-1 rounded-bl-xl text-green-400 text-xs font-bold">
          ВЫПОЛНЕНО
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-white text-sm">{goal.title}</h4>
        {goal.type === 'dream' ? (
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ) : (
          <Target className="w-4 h-4 text-blue-400" />
        )}
      </div>
      <p className="text-white/60 text-xs mb-3">{goal.description}</p>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs text-white/40">
          <span>Прогресс</span>
          <span>{Math.round((goal.progress / goal.target) * 100)}%</span>
        </div>
        <Progress value={(goal.progress / goal.target) * 100} className="h-1.5" />
      </div>

      <div className="flex gap-3 text-xs">
        <div className="flex items-center gap-1 text-rose-400">
          <Heart className="w-3 h-3" />
          <span>+{goal.reward.perTurnReward.happiness ?? 0}/ход</span>
        </div>
        <div className="flex items-center gap-1 text-purple-400">
          <Brain className="w-3 h-3" />
          <span>+{goal.reward.perTurnReward.sanity ?? 0}/ход</span>
        </div>
      </div>
    </div>
  )
}
