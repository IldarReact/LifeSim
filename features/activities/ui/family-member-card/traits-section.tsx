'use client'

import { User } from 'lucide-react'
import React from 'react'

import { StatEffect } from '@/core/types/stats.types'
import traitsData from '@/shared/data/world/commons/human-traits.json'

interface Trait {
  id: string
  name: string
  description: string
  effects?: StatEffect
}

interface TraitsSectionProps {
  player: {
    traits?: string[]
  }
}

export function TraitsSection({ player }: TraitsSectionProps) {
  if (!player.traits || player.traits.length === 0) return null

  const allTraits = traitsData as unknown as Trait[]

  return (
    <section>
      <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
        <User className="w-4 h-4 text-purple-400" />
        Черты характера
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {player.traits.map((traitId) => {
          const trait = allTraits.find((t) => t.id === traitId)
          if (!trait) return null
          return (
            <div
              key={traitId}
              className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="font-bold text-white text-sm">{trait.name}</div>
              <div className="text-xs text-white/50 mt-1 line-clamp-2">{trait.description}</div>
              {trait.effects && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(trait.effects).map(([stat, val]) => {
                    const numericVal = val as number
                    return (
                      <div
                        key={stat}
                        className={`text-[10px] px-1.5 py-0.5 rounded bg-black/30 ${numericVal > 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {stat === 'happiness' && 'Счастье'}
                        {stat === 'sanity' && 'Рассудок'}
                        {stat === 'health' && 'Здоровье'}
                        {stat === 'energy' && 'Энергия'}
                        {stat === 'intelligence' && 'Интеллект'} {numericVal > 0 ? '+' : ''}
                        {numericVal}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
