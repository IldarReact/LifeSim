'use client'

import { Heart, DollarSign, Baby, Dog, Search, X } from 'lucide-react'
import React from 'react'

import { FamilyFinancesCard } from '../ui/family-finances-card'
import { FamilyMemberCard } from '../ui/family-member-card'
import { OpportunityCard } from '../ui/opportunity-card'

import { useFamilyPricing } from './use-family-pricing'

import { FAMILY_PRICES } from '@/core/lib/calculations/family-prices'
import { useGameStore } from '@/core/model/store'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Progress } from '@/shared/ui/progress'
import { SectionSeparator } from '@/shared/ui/section-separator'

export function FamilyActivity(): React.JSX.Element | null {
  const { player, startDating, acceptPartner, rejectPartner, tryForBaby, adoptPet } = useGameStore()
  const prices = useFamilyPricing()

  if (!player) return null

  const { familyMembers, isDating, potentialPartner, pregnancy } = player.personal
  const hasPartner = familyMembers?.some((m) => m.type === 'wife' || m.type === 'husband')

  return (
    <div className="space-y-8 pb-10">
      <SectionSeparator title="Семья" />

      {/* Finances Summary */}
      <FamilyFinancesCard />

      {/* Dating Status */}
      {isDating && !potentialPartner && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
            <Search className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h4 className="font-bold text-white">В активном поиске...</h4>
            <p className="text-white/60 text-sm">
              Вы ищете свою вторую половинку. Результаты будут в следующем квартале.
            </p>
          </div>
        </div>
      )}

      {/* Potential Partner */}
      {potentialPartner && (
        <div className="bg-linear-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/30 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl border-2 border-white/20">
              👤
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h3 className="text-2xl font-bold text-white">{potentialPartner.name}</h3>
                <Badge
                  variant="secondary"
                  className="bg-rose-500/20 text-rose-200 border-rose-500/30"
                >
                  {potentialPartner.age} лет
                </Badge>
              </div>
              <p className="text-white/80 mb-2">{potentialPartner.occupation}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Доход: ${potentialPartner.income}
                </span>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button
                onClick={rejectPartner}
                variant="outline"
                className="flex-1 border-white/10 hover:bg-white/10 text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Отказать
              </Button>
              <Button
                onClick={acceptPartner}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
              >
                <Heart className="w-4 h-4 mr-2 fill-current" />
                Начать отношения
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pregnancy */}
      {pregnancy && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Baby className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h4 className="font-bold text-white">Ожидание ребенка</h4>
            <p className="text-white/60 text-sm">
              До рождения осталось:{' '}
              <span className="text-white font-bold">{pregnancy.turnsLeft} кв.</span>
            </p>
            <Progress value={((3 - pregnancy.turnsLeft) / 3) * 100} className="h-2 mt-2 w-48" />
          </div>
        </div>
      )}

      {/* Housing Capacity Warning */}
      {player.housingId &&
        (() => {
          const { useHousingCapacity } = require('./use-housing-capacity')
          const housing = useHousingCapacity()

          if (housing.status === 'critical') {
            return (
              <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">Жильё критически переполнено!</h4>
                  <p className="text-white/60 text-sm mb-2">
                    Занято {housing.familySize}/{housing.capacity} мест (+
                    {Math.round(housing.overcrowdingPercent)}% переполнения)
                  </p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-red-400">Счастье: -{housing.penalty}</span>
                    <span className="text-red-400">Рассудок: -{housing.penalty}</span>
                    <span className="text-red-400">
                      Интеллект: -{Math.floor(housing.penalty / 2)}
                    </span>
                  </div>
                </div>
              </div>
            )
          }

          if (housing.status === 'warning') {
            return (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">Жильё переполнено</h4>
                  <p className="text-white/60 text-sm mb-2">
                    Занято {housing.familySize}/{housing.capacity} мест (+
                    {Math.round(housing.overcrowdingPercent)}% переполнения)
                  </p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-amber-400">Счастье: -{housing.penalty}</span>
                    <span className="text-amber-400">Рассудок: -{housing.penalty}</span>
                    <span className="text-amber-400">
                      Интеллект: -{Math.floor(housing.penalty / 2)}
                    </span>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">
                Занято {housing.familySize}/{housing.capacity} мест в жилье
              </p>
            </div>
          )
        })()}

      {/* Family Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Player Card */}
        <FamilyMemberCard isPlayer={true} />

        {/* Family Members */}
        {familyMembers?.map((member) => (
          <FamilyMemberCard key={member.id} member={member} />
        ))}

        {(!familyMembers || familyMembers.length === 0) && !potentialPartner && !isDating && (
          <div className="col-span-full text-center py-10 bg-white/5 rounded-2xl border border-white/10 border-dashed">
            <p className="text-white/40">У вас пока нет семьи</p>
          </div>
        )}
      </div>

      <SectionSeparator title="Возможности" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {!hasPartner && !isDating && !potentialPartner && (
          <OpportunityCard
            title="Найти партнера"
            description="Начать активный поиск второй половинки. Требует времени и денег на свидания."
            icon={<Heart className="w-6 h-6 text-rose-400" />}
            actionLabel={`Искать ($${prices.datingSearch.toLocaleString()}, ${FAMILY_PRICES.DATING_ENERGY_COST} эн.)`}
            onAction={startDating}
          />
        )}

        {hasPartner && !pregnancy && (
          <OpportunityCard
            title="Завести ребенка"
            description="Серьезный шаг. Требует стабильного дохода и жилья. Беременность длится 9 месяцев."
            icon={<Baby className="w-6 h-6 text-blue-400" />}
            actionLabel="Планировать"
            onAction={tryForBaby}
          />
        )}

        <OpportunityCard
          title="Завести питомца"
          description="Верный друг, который всегда поддержит. Выберите питомца по душе."
          icon={<Dog className="w-6 h-6 text-amber-400" />}
          actionLabel="Выбрать питомца"
        >
          <div className="grid grid-cols-1 gap-3">
            {[
              { type: 'dog' as const, name: 'Собака', price: 500 },
              { type: 'cat' as const, name: 'Кот', price: 300 },
              { type: 'hamster' as const, name: 'Хомяк', price: 50 },
            ].map((pet) => {
              const petPrice =
                pet.type === 'dog'
                  ? prices.petDog
                  : pet.type === 'cat'
                    ? prices.petCat
                    : prices.petHamster
              return (
                <div
                  key={pet.type}
                  className="bg-white/5 p-4 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐈' : '🐹'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{pet.name}</h4>
                      <p className="text-xs text-white/60">
                        {pet.type === 'dog'
                          ? 'Верный друг'
                          : pet.type === 'cat'
                            ? 'Независимый'
                            : 'Милый'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => adoptPet(pet.type, 'Имя', petPrice)}
                    className="bg-white/10 hover:bg-white/20"
                  >
                    ${petPrice.toLocaleString()}
                  </Button>
                </div>
              )
            })}
            )
          </div>
        </OpportunityCard>
      </div>
    </div>
  )
}
