'use client'

import React from 'react'

import { AllBusinessesDialog } from './all-businesses-dialog'

import { useEconomy } from '@/core/hooks'
import { createBusinessPurchase } from '@/core/lib/business/purchase-logic'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import type { BusinessTemplate } from '@/core/lib/data-loaders/businesses-loader'
import { useGameStore } from '@/core/model/store'

interface BusinessesSectionProps {
  playerCash: number
  onOpenBusiness: (
    business: import('@/core/types/business.types').Business,
    upfrontCost: number,
  ) => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function BusinessesSection({
  playerCash,
  onOpenBusiness,
  onSuccess,
  onError,
}: BusinessesSectionProps) {
  const { sendOffer, turn: currentTurn } = useGameStore()
  const economy = useEconomy()

  const handleOpenWithPartner = (
    partnerId: string,
    partnerName: string,
    playerShare: number,
    template: BusinessTemplate,
  ) => {
    const inflatedCost = economy
      ? getInflatedPrice(template.initialCost, economy, 'business')
      : template.initialCost

    const { cost: playerInvestment } = createBusinessPurchase(
      {
        id: template.id,
        name: template.name,
        type: template.type,
        description: template.description || '',
        initialCost: template.initialCost,
        monthlyIncome: template.monthlyIncome,
        monthlyExpenses: template.monthlyExpenses,
        maxEmployees: template.maxEmployees || 25,
        minEmployees: template.minEmployees || 1,
        employeeRoles: template.employeeRoles || [],
        upfrontPaymentPercentage: template.upfrontPaymentPercentage || 20,
      },
      inflatedCost,
      currentTurn,
      {
        partnerId,
        partnerName,
        playerShare,
      },
    )

    const partnerInvestment = inflatedCost - playerInvestment

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
        businessType: template.type,
        businessName: template.name,
        businessDescription: template.description || '',
        totalCost: inflatedCost,
        partnerShare: 100 - playerShare,
        partnerInvestment: partnerInvestment,
        yourShare: playerShare,
        yourInvestment: playerInvestment,
        employeeRoles: template.employeeRoles || [],
      },
      `Предлагаю открыть ${template.name} вместе!`,
    )

    onSuccess(`Предложение отправлено ${partnerName}!`)
  }

  return (
    <AllBusinessesDialog
      playerCash={playerCash}
      onOpenBusiness={onOpenBusiness}
      onOpenWithPartner={handleOpenWithPartner}
      onSuccess={onSuccess}
      onError={onError}
    />
  )
}
