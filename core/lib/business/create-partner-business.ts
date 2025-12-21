import type { Business, BusinessType, EmployeeRole } from '@/core/types/business.types'

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

  return {
    id: businessId,
    name: offer.details.businessName,
    type: offer.details.businessType,
    description: offer.details.businessDescription,
    state: 'active',
    price: Math.floor(offer.details.totalCost * 0.8),
    quantity: 1,
    isServiceBased: false,
    networkId: undefined,
    isMainBranch: false,
    partnerBusinessId,
    partnerId: offer.fromPlayerId,
    partnerName: offer.fromPlayerName,
    playerShare: offer.details.yourShare,
    playerInvestment: offer.details.yourInvestment,
    partners: [
      // Текущий игрок
      {
        id: playerId,
        name: 'Вы', // Будет заменено на реальное имя в UI
        type: 'player' as const,
        share: offer.details.yourShare,
        investedAmount: offer.details.yourInvestment,
        relation: 100, // Максимальное отношение к себе
      },
      // Партнёр
      {
        id: offer.fromPlayerId,
        name: offer.fromPlayerName,
        type: 'player' as const,
        share: 100 - offer.details.yourShare,
        investedAmount: offer.details.totalCost - offer.details.yourInvestment,
        relation: 50,
      },
    ],
    proposals: [],
    openingProgress: {
      totalQuarters: 0,
      quartersLeft: 0,
      investedAmount: offer.details.totalCost,
      totalCost: offer.details.totalCost,
      upfrontCost: offer.details.totalCost * 0.3,
    },
    creationCost: { energy: 20 },
    initialCost: offer.details.totalCost,
    quarterlyIncome: 0,
    quarterlyExpenses: 0,
    currentValue: offer.details.totalCost,
    walletBalance: 0,
    taxRate: 0.15,
    hasInsurance: true,
    insuranceCost: offer.details.totalCost * 0.01,
    inventory: {
      currentStock: 0,
      maxStock: 100,
      pricePerUnit: 10,
      purchaseCost: 5,
      autoPurchaseAmount: 0,
    },
    employees: [],
    maxEmployees: 5,
    minEmployees: 1,
    requiredRoles: ['manager', 'accountant', 'lawyer'],
    playerRoles: {
      managerialRoles: isInitiator
        ? (['manager', 'accountant'] as EmployeeRole[])
        : (['manager'] as EmployeeRole[]),
      operationalRole: null,
    },
    reputation: 50,
    efficiency: 50,
    eventsHistory: [],
    foundedTurn: currentTurn,
    lastQuarterlyUpdate: currentTurn,
    createdAt: currentTurn,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    autoPurchaseAmount: 0,
  }
}
