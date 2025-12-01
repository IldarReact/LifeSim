'use client'

import React from 'react'
import { useGameStore } from '@/core/model/game-store'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Progress } from '@/shared/ui/progress'
import { DollarSign, ChevronRight, Target, Star, Heart, Brain, User, Utensils, Home } from 'lucide-react'
import type { FamilyMember, LifeGoal } from '@/core/types'
import { getShopItem, getRecurringItemsByCategory } from '@/core/lib/shop-helpers'

interface FamilyMemberCardProps {
  member?: FamilyMember
  isPlayer?: boolean
}

export function FamilyMemberCard({ member, isPlayer = false }: FamilyMemberCardProps) {
  const { player, setLifestyle, setMemberFoodPreference } = useGameStore()

  if (!player) return null

  const displayData = isPlayer ? {
    id: player.id,
    name: player.name,
    type: 'player' as const,
    age: player.age,
    relationLevel: 100,
    income: player.quarterlySalary,
    expenses: 0,
    passiveEffects: {},
    goals: player.personal.lifeGoals,
    foodPreference: player.activeLifestyle?.food,
    housingPreference: player.activeLifestyle?.real_estate
  } : member

  if (!displayData) return null

  const foodItem = displayData.foodPreference ? getShopItem(displayData.foodPreference) : null
  const housingItem = displayData.housingPreference ? getShopItem(displayData.housingPreference) : null

  const getTypeLabel = () => {
    if (isPlayer) return 'Вы'
    if (!member) return ''
    switch (member.type) {
      case 'wife': return 'Жена'
      case 'husband': return 'Муж'
      case 'child': return 'Ребенок'
      case 'pet': return 'Питомец'
      case 'parent': return 'Родитель'
      default: return member.type
    }
  }

  const getIcon = () => {
    if (isPlayer) return <User className="w-6 h-6" />
    if (!member) return <User className="w-6 h-6" />
    switch (member.type) {
      case 'pet': return '🐾'
      case 'child': return '👶'
      default: return '👤'
    }
  }

  return (
    <div className={`bg-white/5 border rounded-2xl p-6 hover:border-white/20 transition-colors flex flex-col h-full ${isPlayer ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10'
      }`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${isPlayer ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10'
          }`}>
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
            <span className="ml-auto text-green-400">${foodItem.costPerTurn || foodItem.price}/кв</span>
          </div>
        )}
        {isPlayer && housingItem && (
          <div className="flex items-center gap-2 text-xs bg-white/5 rounded-lg p-2">
            <Home className="w-3 h-3 text-blue-400" />
            <span className="text-white/70">{housingItem.name}</span>
            <span className="ml-auto text-green-400">${housingItem.costPerTurn || housingItem.price}/кв</span>
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

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full border-white/10 hover:bg-white/10 text-white text-xs h-8">
            Подробнее
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">{typeof getIcon() === 'string' ? getIcon() : '👤'}</span>
              <div>
                <div className="text-xl font-bold">{displayData.name}</div>
                <div className="text-sm font-normal text-white/60">
                  {getTypeLabel()}, {displayData.age} лет
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {isPlayer && displayData.goals && displayData.goals.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  Цели и Мечты
                </h4>
                <div className="space-y-3">
                  {displayData.goals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">
                Образ жизни
              </h4>

              <div className="mb-4">
                <label className="text-xs text-white/60 mb-2 block">Питание</label>
                <div className="grid grid-cols-1 gap-2">
                  {getRecurringItemsByCategory('food').map(item => {
                    const isActive = displayData.foodPreference === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (isPlayer) {
                            setLifestyle('food', item.id)
                          } else if (member) {
                            setMemberFoodPreference(member.id, item.id)
                          }
                        }}
                        className={`text-left p-3 rounded-lg border transition-all ${isActive
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
                              ${item.costPerTurn || item.price}
                            </div>
                            <div className="text-xs text-white/40">/квартал</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {isPlayer && (
                <div>
                  <label className="text-xs text-white/60 mb-2 block">Жилье</label>
                  <div className="grid grid-cols-1 gap-2">
                    {getRecurringItemsByCategory('real_estate').map(item => {
                      const isActive = displayData.housingPreference === item.id
                      const canAfford = player.stats.money >= item.price

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (canAfford || item.price === 0) {
                              setLifestyle('real_estate', item.id)
                            }
                          }}
                          disabled={!canAfford && item.price > 0}
                          className={`text-left p-3 rounded-lg border transition-all ${isActive
                              ? 'bg-blue-500/20 border-blue-500/50'
                              : canAfford || item.price === 0
                                ? 'bg-white/5 border-white/10 hover:border-white/20'
                                : 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-white text-sm">{item.name}</div>
                              <div className="text-xs text-white/60">{item.description}</div>
                              {item.price > 0 && (
                                <div className="text-xs text-amber-400 mt-1">
                                  Покупка: ${item.price.toLocaleString()}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-bold text-green-400">
                                ${item.costPerTurn || item.price}
                              </div>
                              <div className="text-xs text-white/40">/квартал</div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {!isPlayer && member && (
              <div>
                <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">
                  Влияние на жизнь
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-xs text-white/50 mb-1">Счастье</div>
                    <div className="text-lg font-bold text-rose-400">
                      +{member.passiveEffects?.happiness || 0}/ход
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-xs text-white/50 mb-1">Рассудок</div>
                    <div className="text-lg font-bold text-purple-400">
                      +{member.passiveEffects?.sanity || 0}/ход
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-xs text-white/50 mb-1">Доход</div>
                    <div className="text-lg font-bold text-green-400">+${member.income}</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-xs text-white/50 mb-1">Расходы</div>
                    <div className="text-lg font-bold text-red-400">-${member.expenses}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GoalCard({ goal }: { goal: LifeGoal }) {
  return (
    <div className={`bg-white/5 border ${goal.isCompleted ? 'border-green-500/30' : 'border-white/10'} rounded-xl p-4 relative overflow-hidden`}>
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
