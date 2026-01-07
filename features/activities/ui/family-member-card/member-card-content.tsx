'use client'

import React from 'react'
import { Utensils, Car, DollarSign, Brain, Heart } from 'lucide-react'

import type { FamilyMember, ShopItem } from '@/core/types'
import { Progress } from '@/shared/ui/progress'

interface MemberDisplayData {
  id: string
  name: string
  type: FamilyMember['type'] | 'player'
  age: number
  income: number
  expenses: number
  foodPreference?: string
  transportPreference?: string
}

interface MemberCardContentProps {
  isPlayer: boolean
  displayData: MemberDisplayData
  member?: FamilyMember
  foodItem: ShopItem | null
  foodPrice: number
  transportItem: ShopItem | null
  transportPrice: number
  getIcon: () => React.ReactNode
  getTypeLabel: () => string
}

export function MemberCardContent({
  isPlayer,
  displayData,
  member,
  foodItem,
  foodPrice,
  transportItem,
  transportPrice,
  getIcon,
  getTypeLabel,
}: MemberCardContentProps) {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${
            isPlayer ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10'
          }`}
        >
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white line-clamp-1">{displayData.name}</h4>
          <p className="text-white/60 text-sm">
            {getTypeLabel()} • {displayData.age} лет
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {foodItem && (
          <div className="flex items-center gap-2 text-xs bg-white/5 rounded-lg p-2">
            <Utensils className="w-3 h-3 text-orange-400" />
            <span className="text-white/70">{foodItem.name}</span>
            <span className="ml-auto text-green-400">${foodPrice.toLocaleString()}/кв</span>
          </div>
        )}
        {transportItem && (
          <div className="flex items-center gap-2 text-xs bg-white/5 rounded-lg p-2">
            <Car className="w-3 h-3 text-purple-400" />
            <span className="text-white/70">{transportItem.name}</span>
            <span className="ml-auto text-green-400">${transportPrice.toLocaleString()}/кв</span>
          </div>
        )}
      </div>

      {!isPlayer && member && (
        <div className="space-y-3 mb-4 flex-1">
          <div>
            <div className="flex justify-between text-xs text-white/40 mb-1">
              <span>Отношения</span>
              <span>{member.relationLevel}%</span>
            </div>
            <Progress value={member.relationLevel} className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {member.income > 0 && (
              <div className="bg-green-500/10 rounded-lg p-2 flex items-center gap-2 text-green-400">
                <DollarSign className="w-3 h-3" />
                <span>+${member.income}</span>
              </div>
            )}
            {member.expenses > 0 && (
              <div className="bg-red-500/10 rounded-lg p-2 flex items-center gap-2 text-red-400">
                <DollarSign className="w-3 h-3" />
                <span>-${member.expenses}</span>
              </div>
            )}
            {member.passiveEffects?.happiness && (
              <div className="bg-rose-500/10 rounded-lg p-2 flex items-center gap-2 text-rose-400">
                <Heart className="w-3 h-3" />
                <span>+{member.passiveEffects.happiness}</span>
              </div>
            )}
            {member.passiveEffects?.sanity && (
              <div className="bg-purple-500/10 rounded-lg p-2 flex items-center gap-2 text-purple-400">
                <Brain className="w-3 h-3" />
                <span>+{member.passiveEffects.sanity}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
