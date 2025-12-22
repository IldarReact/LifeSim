/**
 * Shared business purchase logic to ensure DRY compliance across solo and partner flows.
 */

import { createBusinessObject } from './create-business'
import type { Business, BusinessType, EmployeeRole, BusinessInventory } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

export interface BusinessTemplate {
  id: string
  name: string
  description: string
  initialCost: number
  monthlyIncome: number
  monthlyExpenses: number
  maxEmployees: number
  minEmployees?: number
  requiredRoles?: EmployeeRole[]
  inventory?: BusinessInventory
  upfrontPaymentPercentage?: number
}

export interface PartnerConfig {
  partnerId: string
  partnerName: string
  playerShare: number // 0-100
}

export interface PurchaseResult {
  business: Business & { partnerBusinessId?: string }
  cost: number // The amount the player actually pays upfront
}

/**
 * Unifies the creation of a business object and calculates the upfront cost.
 */
export function createBusinessPurchase(
  template: BusinessTemplate,
  inflatedCost: number,
  currentTurn: number,
  partnerConfig?: PartnerConfig & { partnerBusinessId?: string },
): PurchaseResult {
  const upfrontPercentage = template.upfrontPaymentPercentage ?? 20 // Default to 20%
  const totalCost = inflatedCost

  // Calculate how much the player pays
  let playerInvestment: number
  let business: Business & { partnerBusinessId?: string }

  if (partnerConfig) {
    // Partner purchase: player pays their share of the total cost
    playerInvestment = Math.round((totalCost * partnerConfig.playerShare) / 100)

    // Create business with partner info
    business = createBusinessObject({
      name: template.name,
      type: (template.id.startsWith('bus_')
        ? template.id.replace('bus_', '')
        : template.id) as BusinessType,
      description: template.description,
      totalCost: totalCost,
      upfrontCost: totalCost * (upfrontPercentage / 100), // Internal tracking of upfront cost
      creationCost: { energy: -20 }, // Standard energy cost for starting with partner
      openingQuarters: 1,
      monthlyIncome: template.monthlyIncome,
      monthlyExpenses: template.monthlyExpenses,
      maxEmployees: template.maxEmployees,
      minEmployees: template.minEmployees ?? 1,
      requiredRoles: template.requiredRoles ?? [],
      inventory: template.inventory,
      currentTurn,
    })

    // Add partner specific data
    business.partners = [
      {
        id: 'player', // Placeholder
        name: 'Вы',
        type: 'player',
        share: partnerConfig.playerShare,
        investedAmount: playerInvestment,
        relation: 100,
      },
      {
        id: partnerConfig.partnerId,
        name: partnerConfig.partnerName,
        type: 'player',
        share: 100 - partnerConfig.playerShare,
        investedAmount: totalCost - playerInvestment,
        relation: 50,
      },
    ]
    business.playerShare = partnerConfig.playerShare
    business.playerInvestment = playerInvestment
    business.partnerId = partnerConfig.partnerId
    business.partnerName = partnerConfig.partnerName
    business.partnerBusinessId = partnerConfig.partnerBusinessId
  } else {
    // Solo purchase: player pays the upfront percentage
    playerInvestment = Math.round(totalCost * (upfrontPercentage / 100))

    business = createBusinessObject({
      name: template.name,
      type: (template.id.startsWith('bus_')
        ? template.id.replace('bus_', '')
        : template.id) as BusinessType,
      description: template.description,
      totalCost: totalCost,
      upfrontCost: playerInvestment,
      creationCost: { energy: -15 }, // Standard energy cost for solo start
      openingQuarters: 1,
      monthlyIncome: template.monthlyIncome,
      monthlyExpenses: template.monthlyExpenses,
      maxEmployees: template.maxEmployees,
      minEmployees: template.minEmployees ?? 1,
      requiredRoles: template.requiredRoles ?? [],
      inventory: template.inventory,
      currentTurn,
    })
  }

  return {
    business,
    cost: playerInvestment,
  }
}
