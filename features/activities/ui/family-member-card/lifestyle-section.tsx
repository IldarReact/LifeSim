'use client'

import React from 'react'

import { useInflatedPrice } from '@/core/hooks'
import { getRecurringItemsByCategory } from '@/core/lib/shop-helpers'
import { useGameStore } from '@/core/model/store'
import type { FamilyMember } from '@/core/types'
import { ClickFeedback } from '@/shared/ui/feedback-animation'

interface MemberDisplayData {
  foodPreference?: string
  transportPreference?: string
}

interface LifestyleSectionProps {
  member?: FamilyMember
  isPlayer: boolean
  displayData: MemberDisplayData
}

export function LifestyleSection({ member, isPlayer, displayData }: LifestyleSectionProps) {
  const { setLifestyle, setMemberFoodPreference, setMemberTransportPreference } = useGameStore()

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">
          Образ жизни
        </h4>

        <div className="mb-4">
          <label className="text-xs text-white/60 mb-2 block">Питание</label>
          <div className="grid grid-cols-1 gap-2">
            {getRecurringItemsByCategory('food').map((item) => {
              const isActive = displayData.foodPreference === item.id
              const itemPrice = useInflatedPrice(item)
              return (
                <ClickFeedback
                  key={item.id}
                  onClick={() => {
                    if (isPlayer) {
                      setLifestyle('food', item.id)
                    } else if (member) {
                      setMemberFoodPreference(member.id, item.id)
                    }
                  }}
                  className={`text-left p-3 rounded-lg border transition-all w-full ${
                    isActive
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white text-sm">{item.name}</div>
                      <div className="text-xs text-white/60">{item.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        ${itemPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-white/40">/квартал</div>
                    </div>
                  </div>
                </ClickFeedback>
              )
            })}
          </div>
        </div>
      </div>

      {(isPlayer || (member && member.age >= 10 && member.type !== 'pet')) && (
        <div className="mt-4">
          <label className="text-xs text-white/60 mb-2 block">Транспорт</label>
          <div className="grid grid-cols-1 gap-2">
            {getRecurringItemsByCategory('transport').map((item) => {
              const isActive = displayData.transportPreference === item.id
              const itemPrice = useInflatedPrice(item)

              return (
                <ClickFeedback
                  key={item.id}
                  onClick={() => {
                    if (isPlayer) {
                      setLifestyle('transport', item.id)
                    } else if (member) {
                      setMemberTransportPreference(member.id, item.id)
                    }
                  }}
                  className={`text-left p-3 rounded-lg border transition-all w-full ${
                    isActive
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{item.name}</div>
                      <div className="text-xs text-white/60">{item.description}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-bold text-green-400">
                        ${itemPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-white/40">/кв</div>
                    </div>
                  </div>
                </ClickFeedback>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
