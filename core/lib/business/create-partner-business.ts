import { createBusinessPurchase } from './purchase-logic'

import type {
  Business,
  BusinessType,
  BusinessRoleTemplate,
  BusinessInventory,
} from '@/core/types'

export function createPartnerBusiness(
  offer: {
    details: {
      businessName: string
      businessType: BusinessType
      businessDescription: string
      totalCost: number
      yourInvestment: number
      yourShare: number
      businessId?: string
      monthlyIncome?: number
      monthlyExpenses?: number
      maxEmployees?: number
      minEmployees?: number
      employeeRoles: BusinessRoleTemplate[]
      inventory?: BusinessInventory
    }
    fromPlayerId: string
    fromPlayerName: string
  },
  currentTurn: number,
  playerId: string,
  isInitiator: boolean = false,
): Business & { partnerBusinessId?: string } {
  const now = Date.now()
  const businessId = offer.details.businessId || `biz_${now}`
  const partnerBusinessId = isInitiator ? undefined : `biz_${now + 1}`

  console.log('[createPartnerBusiness] Creating business:', {
    playerId,
    fromPlayerId: offer.fromPlayerId,
    fromPlayerName: offer.fromPlayerName,
    isInitiator,
    yourShare: offer.details.yourShare,
    yourInvestment: offer.details.yourInvestment,
  })

  const { business } = createBusinessPurchase(
    {
      id: businessId,
      type: offer.details.businessType,
      name: offer.details.businessName,
      description: offer.details.businessDescription,
      initialCost: offer.details.totalCost, // Use totalCost as initialCost for the purchase logic
      monthlyIncome: offer.details.monthlyIncome || 0,
      monthlyExpenses: offer.details.monthlyExpenses || 0,
      maxEmployees: offer.details.maxEmployees || 25,
      minEmployees: offer.details.minEmployees,
      employeeRoles: offer.details.employeeRoles,
      inventory: offer.details.inventory,
    },
    offer.details.totalCost,
    currentTurn,
    {
      partnerId: offer.fromPlayerId,
      partnerName: offer.fromPlayerName,
      playerShare: offer.details.yourShare,
      partnerBusinessId,
      initialState: 'active', // Partner businesses in this flow are usually active immediately
    },
  )

  // Ensure the ID from the offer is preserved if it exists
  if (offer.details.businessId) {
    business.id = offer.details.businessId
  }

  // Override the 'Вы' placeholder with the correct playerId
  if (business.partners[0]) {
    business.partners[0].id = playerId
  }

  return business
}
