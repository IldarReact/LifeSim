'use client'

import { Store, TrendingUp, Users, CheckCircle, Star, AlertCircle } from 'lucide-react'
import React from 'react'

import { BusinessDetailCard } from '../../../ui/business-detail-card'
import { OpportunityCard } from '../../../ui/opportunity-card'
import { BusinessDetailDialog } from '../business-management/business-detail-dialog'

import { useEconomy } from '@/core/hooks'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import { getAllBusinessTypesForCountry } from '@/core/lib/data-loaders/businesses-loader'
import { isMultiplayerActive } from '@/core/lib/multiplayer'
import { useGameStore } from '@/core/model/store'
import type { StatEffect } from '@/core/types/stats.types'
import { Button } from '@/shared/ui/button'

interface BusinessesSectionProps {
  playerCash: number
  onOpenBusiness: (
    name: string,
    type: 'retail' | 'service' | 'cafe' | 'tech' | 'manufacturing',
    description: string,
    totalCost: number,
    upfrontCost: number,
    creationCost: StatEffect,
    openingQuarters: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    maxEmployees: number,
    minWorkers: number,
    taxRate: number,
    requiredRoles: import('@/core/types').EmployeeRole[],
    inventory?: import('@/core/types').BusinessInventory,
  ) => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

// Helper to map role to icon
const getRoleIcon = (role: string, priority: string) => {
  const colorClass =
    priority === 'required'
      ? 'text-red-400'
      : priority === 'recommended'
        ? 'text-blue-400'
        : 'text-green-400'

  const iconClass = `w-5 h-5 ${colorClass}`

  switch (role.toLowerCase()) {
    case 'salesperson':
    case 'продавец':
      return <TrendingUp className={iconClass} />
    case 'worker':
    case 'рабочий':
      return <Users className={iconClass} />
    case 'technician':
    case 'техник':
      return <CheckCircle className={iconClass} />
    case 'marketer':
    case 'маркетолог':
      return <Star className={iconClass} />
    case 'manager':
    case 'управляющий':
      return <AlertCircle className={iconClass} />
    default:
      return <CheckCircle className={iconClass} />
  }
}

// Helper to get business type label
const getBusinessTypeLabel = (risk: string, initialCost: number) => {
  if (initialCost < 50000) return 'Малый бизнес'
  if (initialCost < 100000) return 'Средний бизнес'
  return 'Крупный бизнес'
}

export function BusinessesSection({
  playerCash,
  onOpenBusiness,
  onSuccess,
  onError,
}: BusinessesSectionProps) {
  const { player, sendOffer } = useGameStore()
  const countryId = player?.countryId || 'us'
  const economy = useEconomy()

  const businesses = getAllBusinessTypesForCountry(countryId)

  const handleOpenBusiness = (
    name: string,
    type: 'retail' | 'service' | 'cafe' | 'tech' | 'manufacturing',
    description: string,
    cost: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    maxEmployees: number,
    minEmployees: number,
    requiredRoles: import('@/core/types').EmployeeRole[],
    energyCost: number,
    stressImpact: number,
    inventory?: import('@/core/types').BusinessInventory,
  ) => {
    if (playerCash >= cost) {
      onOpenBusiness(
        name,
        type,
        description,
        cost,
        cost * 0.2, // Upfront cost
        { energy: -energyCost },
        1, // Opening quarters
        monthlyIncome,
        monthlyExpenses,
        maxEmployees,
        minEmployees,
        0.15, // Tax rate
        requiredRoles,
        inventory,
      )
      onSuccess(`Вы успешно начали процесс открытия бизнеса "${name}"`)
    } else {
      onError('Недостаточно средств для открытия этого бизнеса')
    }
  }

  const handleOpenWithPartner = (
    business: any,
    partnerId: string,
    partnerName: string,
    playerShare: number,
  ) => {
    const cost = business.initialCost || business.cost || 0
    const playerInvestment = Math.round((cost * playerShare) / 100)
    const partnerInvestment = cost - playerInvestment

    if (playerCash < playerInvestment) {
      onError('Недостаточно средств для вашей доли инвестиций!')
      return
    }

    sendOffer(
      'business_partnership',
      partnerId,
      partnerName,
      {
        businessId: `biz_${Date.now()}`,
        businessType: business.type,
        businessName: business.name,
        businessDescription: business.description,
        totalCost: cost,
        partnerShare: 100 - playerShare,
        partnerInvestment: partnerInvestment,
        yourShare: playerShare,
        yourInvestment: playerInvestment,
      },
      `Предлагаю открыть ${business.name} вместе!`,
    )

    onSuccess(`Предложение отправлено ${partnerName}!`)
  }

  return (
    <OpportunityCard
      title="Открыть бизнес"
      description="Инвестируйте в реальный сектор экономики. Магазины, сервисы, производство - стабильный доход при грамотном управлении."
      icon={<Store className="w-6 h-6 text-[#004d00]" />}
      image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
      actionLabel="Выбрать бизнес"
    >
      <div className="space-y-4">
        <p className="text-white/60 mb-4">
          Открытие бизнеса требует начального капитала и отнимает много энергии на старте. Будьте
          готовы к расходам и стрессу!
        </p>

        {businesses.map((business) => {
          // Apply inflation to business costs
          const inflatedCost = economy
            ? getInflatedPrice(business.initialCost, economy, 'business')
            : business.initialCost
          const inflatedIncome = economy
            ? getInflatedPrice(business.monthlyIncome, economy, 'business')
            : business.monthlyIncome
          const inflatedExpenses = economy
            ? getInflatedPrice(business.monthlyExpenses, economy, 'business')
            : business.monthlyExpenses

          const typeLabel = getBusinessTypeLabel(business.risk, inflatedCost)
          const energyCost = 15
          const stressImpact = 2
          const incomeRange = `$${Math.round(inflatedIncome * 0.6).toLocaleString()} - $${Math.round(inflatedIncome * 1.5).toLocaleString()}/кв`
          const expenses = `$${inflatedExpenses.toLocaleString()}/кв`

          // Map employee roles to requirements with icons
          const requirements = (business.employeeRoles || []).map((role) => ({
            role: role.role,
            priority: role.priority,
            description: role.description,
            icon: getRoleIcon(role.role, role.priority),
          }))

          return (
            <BusinessDetailCard
              key={business.id}
              title={business.name}
              type={typeLabel}
              description={business.description || ''}
              cost={inflatedCost}
              income={incomeRange}
              expenses={expenses}
              energyCost={energyCost}
              stressImpact={`+${stressImpact}`}
              image={
                business.imageUrl ||
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
              }
              detailDialog={
                <BusinessDetailDialog
                  title={business.name}
                  type={typeLabel}
                  description={business.description || ''}
                  cost={inflatedCost}
                  income={incomeRange}
                  expenses={expenses}
                  energyCost={energyCost}
                  stressImpact={`+${stressImpact}`}
                  image={
                    business.imageUrl ||
                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
                  }
                  requirements={requirements}
                  trigger={
                    <Button
                      variant="outline"
                      className="flex-1 text-xs h-9 border-white/20 text-white hover:bg-white/10"
                    >
                      Подробнее
                    </Button>
                  }
                  onBuy={() =>
                    handleOpenBusiness(
                      business.name,
                      business.type as any,
                      business.description || '',
                      inflatedCost,
                      inflatedIncome,
                      inflatedExpenses,
                      business.maxEmployees || 8,
                      business.minEmployees || 1,
                      (business.requiredRoles || []) as import('@/core/types').EmployeeRole[],
                      energyCost,
                      stressImpact,
                      business.inventory as any,
                    )
                  }
                  onOpenWithPartner={
                    isMultiplayerActive()
                      ? (partnerId, partnerName, playerShare) =>
                          handleOpenWithPartner(business, partnerId, partnerName, playerShare)
                      : undefined
                  }
                />
              }
              onBuy={() =>
                handleOpenBusiness(
                  business.name,
                  business.type as any,
                  business.description || '',
                  inflatedCost,
                  inflatedIncome,
                  inflatedExpenses,
                  business.maxEmployees || 8,
                  business.minEmployees || 1,
                  (business.requiredRoles || []) as import('@/core/types').EmployeeRole[],
                  energyCost,
                  stressImpact,
                  business.inventory as any,
                )
              }
            />
          )
        })}
      </div>
    </OpportunityCard>
  )
}
