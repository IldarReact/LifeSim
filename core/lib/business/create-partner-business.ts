import type { Business, BusinessType, EmployeeRole } from '@/core/types/business.types'
import { createBusinessPurchase } from './purchase-logic'

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
      requiredRoles?: EmployeeRole[]
      inventory?: import('@/core/types').BusinessInventory
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
      name: offer.details.businessName,
      description: offer.details.businessDescription,
      initialCost: offer.details.totalCost, // Use totalCost as initialCost for the purchase logic
      monthlyIncome: offer.details.monthlyIncome || 0,
      monthlyExpenses: offer.details.monthlyExpenses || 0,
      maxEmployees: offer.details.maxEmployees || 5,
      minEmployees: offer.details.minEmployees,
      requiredRoles: offer.details.requiredRoles,
      inventory: offer.details.inventory,
    },
    offer.details.totalCost,
    currentTurn,
    {
      partnerId: offer.fromPlayerId,
      partnerName: offer.fromPlayerName,
      playerShare: offer.details.yourShare,
      partnerBusinessId,
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
