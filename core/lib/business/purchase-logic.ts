/**
 * Shared business purchase logic to ensure DRY compliance across solo and partner flows.
 */

import { createBusinessObject } from './create-business'

import type {
  Business,
  BusinessType,
  BusinessInventory,
  BusinessRoleTemplate,
} from '@/core/types'

export interface BusinessTemplate {
  id: string
  name: string
  type?: BusinessType
  description: string
  initialCost: number
  monthlyIncome: number
  monthlyExpenses: number
  maxEmployees: number
  minEmployees?: number
  employeeRoles: BusinessRoleTemplate[]
  inventory?: BusinessInventory
  upfrontPaymentPercentage?: number
}

export interface PartnerConfig {
  partnerId: string
  partnerName: string
  playerShare: number // 0-100
  initialState?: 'active' | 'opening' // Force state
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
  const upfrontPercentage = 100 // Всегда 100% при покупке, никаких "кредитов"
  const totalCost = inflatedCost

  // Calculate how much the player pays
  let playerInvestment: number
  let business: Business & { partnerBusinessId?: string }

  const businessType =
    template.type ||
    ((template.id.startsWith('bus_')
      ? template.id.replace('bus_', '')
      : template.id) as BusinessType)

  if (partnerConfig) {
    // Partner purchase: player pays their share of the total cost
    playerInvestment = Math.round((totalCost * partnerConfig.playerShare) / 100)

    // Create business with partner info
    business = createBusinessObject({
      name: template.name,
      type: businessType,
      description: template.description,
      totalCost: totalCost,
      upfrontCost: totalCost, // 100% оплачено
      creationCost: { energy: -20 }, // Standard energy cost for starting with partner
      openingQuarters: 0, // При покупке с партнером обычно уже готовый бизнес или открывается сразу
      monthlyIncome: template.monthlyIncome,
      monthlyExpenses: template.monthlyExpenses,
      maxEmployees: template.maxEmployees,
      minEmployees: template.minEmployees ?? 1,
      employeeRoles: template.employeeRoles,
      inventory: template.inventory,
      currentTurn,
    })

    // Special initialization for partner businesses (from existing logic)
    business.playerRoles.managerialRoles = ['manager']
    business.hasInsurance = true
    business.insuranceCost = Math.round(totalCost * 0.01) // 1% of total cost

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
    // Solo purchase: player pays 100%
    playerInvestment = totalCost

    business = createBusinessObject({
      name: template.name,
      type: businessType,
      description: template.description,
      totalCost: totalCost,
      upfrontCost: playerInvestment,
      creationCost: { energy: -15 }, // Standard energy cost for solo start
      openingQuarters: 0, // Бизнес становится активным сразу после покупки
      monthlyIncome: template.monthlyIncome,
      monthlyExpenses: template.monthlyExpenses,
      maxEmployees: template.maxEmployees,
      minEmployees: template.minEmployees ?? 1,
      employeeRoles: template.employeeRoles,
      inventory: template.inventory,
      currentTurn,
    })
  }

  return {
    business,
    cost: playerInvestment,
  }
}
