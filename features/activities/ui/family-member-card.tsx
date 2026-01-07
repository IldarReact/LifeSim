'use client'

import { ChevronRight, User } from 'lucide-react'
import React from 'react'

import { MemberCardContent } from './family-member-card/member-card-content'
import { MemberDetailsDialog } from './family-member-card/member-details-dialog'

import { useInflatedPrice } from '@/core/hooks'
import { getShopItem } from '@/core/lib/shop-helpers'
import { useGameStore } from '@/core/model/store'
import type { FamilyMember, LifeGoal } from '@/core/types'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogTrigger } from '@/shared/ui/dialog'

interface FamilyMemberCardProps {
  member?: FamilyMember
  isPlayer?: boolean
}

interface DisplayData {
  id: string
  name: string
  type: FamilyMember['type'] | 'player'
  age: number
  relationLevel: number
  income: number
  expenses: number
  passiveEffects: Record<string, any>
  goals: LifeGoal[]
  foodPreference?: string
  transportPreference?: string
}

export function FamilyMemberCard({ member, isPlayer = false }: FamilyMemberCardProps) {
  const { player } = useGameStore()

  if (!player) return null

  const displayData: DisplayData | undefined = isPlayer
    ? {
        id: player.id,
        name: player.name,
        type: 'player' as const,
        age: Math.floor(player.age),
        relationLevel: 100,
        income: player.quarterlySalary,
        expenses: 0,
        passiveEffects: {},
        goals: player.personal.lifeGoals,
        foodPreference: player.activeLifestyle?.food,
        transportPreference: player.activeLifestyle?.transport,
      }
    : member
      ? {
          ...member,
          goals: member.goals || [],
        }
      : undefined

  if (!displayData) return null

  const foodItem = displayData.foodPreference
    ? getShopItem(displayData.foodPreference, player.countryId)
    : null
  const transportItem = displayData.transportPreference
    ? getShopItem(displayData.transportPreference, player.countryId)
    : null

  // Применить инфляцию к ценам
  const foodPrice = useInflatedPrice(foodItem || { price: 0, category: 'food' })
  const transportPrice = useInflatedPrice(transportItem || { price: 0, category: 'transport' })

  const getTypeLabel = () => {
    if (isPlayer) return 'Вы'
    if (!member) return ''
    switch (member.type) {
      case 'wife':
        return 'Жена'
      case 'husband':
        return 'Муж'
      case 'child':
        return 'Ребенок'
      case 'pet':
        return 'Питомец'
      case 'parent':
        return 'Родитель'
      default:
        return member.type
    }
  }

  const getIcon = () => {
    if (isPlayer) return <User className="w-6 h-6" />
    if (!member) return <User className="w-6 h-6" />
    switch (member.type) {
      case 'pet':
        return '🐾'
      case 'child':
        return '👶'
      default:
        return '👤'
    }
  }

  return (
    <div
      className={`bg-white/5 border rounded-2xl p-6 hover:border-white/20 transition-colors flex flex-col h-full ${
        isPlayer ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10'
      }`}
    >
      <MemberCardContent
        isPlayer={isPlayer}
        displayData={displayData}
        member={member}
        foodItem={foodItem || null}
        foodPrice={foodPrice}
        transportItem={transportItem || null}
        transportPrice={transportPrice}
        getIcon={getIcon}
        getTypeLabel={getTypeLabel}
      />

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full border-white/10 hover:bg-white/10 text-white text-xs h-8"
          >
            Подробнее
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </DialogTrigger>
        <MemberDetailsDialog
          member={member}
          isPlayer={isPlayer}
          player={player}
          displayData={displayData}
          getTypeLabel={getTypeLabel}
          getIcon={getIcon}
        />
      </Dialog>
    </div>
  )
}
