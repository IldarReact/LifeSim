'use client'

import { Store } from 'lucide-react'
import React from 'react'

import { PartnerSelectionDialog } from '../../partner-selection-dialog'
import { formatCurrency } from '../utils/business-ui-mappers'

import { BusinessCard } from './all-businesses-dialog/business-card'
import { DialogTriggerContent } from './all-businesses-dialog/dialog-trigger-content'
import { InfoBanner } from './all-businesses-dialog/info-banner'

import { useEconomy } from '@/core/hooks'
import { calculateEstimatedMonthlyProfit } from '@/core/lib/business/business-financials'
import { createBusinessPurchase } from '@/core/lib/business/purchase-logic'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import {
  getAllBusinessTypesForCountry,
  type BusinessTemplate,
} from '@/core/lib/data-loaders/businesses-loader'
import { isMultiplayerActive } from '@/core/lib/multiplayer'
import { useGameStore } from '@/core/model/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'

interface AllBusinessesDialogProps {
  playerCash: number
  onOpenBusiness: (business: import('@/core/types').Business, upfrontCost: number) => void
  onOpenWithPartner?: (
    partnerId: string,
    partnerName: string,
    playerShare: number,
    template: BusinessTemplate,
  ) => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function AllBusinessesDialog({
  playerCash,
  onOpenBusiness,
  onOpenWithPartner,
  onSuccess,
  onError,
}: AllBusinessesDialogProps) {
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string | null>(null)
  const [partnerDialogOpen, setPartnerDialogOpen] = React.useState(false)
  const [templateForPartner, setTemplateForPartner] = React.useState<BusinessTemplate | null>(null)
  const economy = useEconomy()
  const { player, turn: currentTurn } = useGameStore()

  const countryId = player?.countryId || 'us'
  const businessTemplates = getAllBusinessTypesForCountry(countryId)

  const selectedBusiness = businessTemplates.find((b) => b.id === selectedBusinessId)

  const handleOpenBusiness = (template: BusinessTemplate) => {
    try {
      const inflatedCost = economy
        ? getInflatedPrice(template.initialCost, economy, 'business')
        : template.initialCost

      const { business, cost: upfrontCost } = createBusinessPurchase(
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
          upfrontPaymentPercentage: 100,
        },
        inflatedCost,
        currentTurn,
      )

      if (playerCash >= upfrontCost) {
        onOpenBusiness(business, upfrontCost)
        onSuccess(`Бизнес "${template.name}" успешно открыт!`)
      } else {
        onError(`Недостаточно средств. Необходимо $${upfrontCost.toLocaleString()}`)
      }
    } catch (error) {
      console.error('Failed to open business:', error)
      onError('Ошибка при открытии бизнеса')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DialogTriggerContent businessTemplates={businessTemplates} />
      </DialogTrigger>

      <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/20 text-white w-[95vw] md:w-[85vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl flex items-center gap-3 text-white">
            <Store className="w-8 h-8 text-emerald-400" />
            Выбор бизнеса
          </DialogTitle>
          <p className="text-white/80 text-base mt-2">
            Ваш бюджет:{' '}
            <span className="text-green-400 font-bold">${playerCash.toLocaleString()}</span>
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 mt-6">
          {businessTemplates.map((template) => {
            const inflatedCost = economy
              ? getInflatedPrice(template.initialCost, economy, 'business')
              : template.initialCost

            const upfrontCost = Math.round(inflatedCost)
            const canAfford = playerCash >= upfrontCost
            const isSelected = selectedBusinessId === template.id

            const corporateTaxRate = economy?.corporateTaxRate || 15
            const estProfit = calculateEstimatedMonthlyProfit(
              template.monthlyIncome,
              template.monthlyExpenses,
              corporateTaxRate,
            )

            const minIncome = Math.round(estProfit * 0.7)
            const maxIncome = Math.round(estProfit * 1.3)

            const incomeRange = `${formatCurrency(minIncome)} - ${formatCurrency(maxIncome)}/мес`
            const expenses = `${formatCurrency(template.monthlyExpenses)}/мес`

            return (
              <BusinessCard
                key={template.id}
                template={template}
                upfrontCost={upfrontCost}
                canAfford={canAfford}
                isSelected={isSelected}
                incomeRange={incomeRange}
                expenses={expenses}
                onSelect={() => setSelectedBusinessId(template.id)}
                onOpen={handleOpenBusiness}
                onOpenWithPartner={(t) => {
                  setTemplateForPartner(t)
                  setPartnerDialogOpen(true)
                }}
                showPartnerButton={!!onOpenWithPartner && isMultiplayerActive()}
              />
            )
          })}
        </div>

        {/* Partner Selection Dialog */}
        {templateForPartner && (
          <PartnerSelectionDialog
            isOpen={partnerDialogOpen}
            onClose={() => {
              setPartnerDialogOpen(false)
              setTemplateForPartner(null)
            }}
            businessName={templateForPartner.name}
            businessCost={
              economy
                ? getInflatedPrice(templateForPartner.initialCost, economy, 'business')
                : templateForPartner.initialCost
            }
            onSelectPartner={(partnerId, partnerName, playerShare) => {
              onOpenWithPartner?.(partnerId, partnerName, playerShare, templateForPartner)
            }}
          />
        )}

        <InfoBanner />
      </DialogContent>
    </Dialog>
  )
}
