import { Business, BusinessChangeType } from '@/core/types/business.types'

/**
 * Проверяет, может ли игрок вносить изменения в бизнес без согласования
 * @returns true если доля > 50%
 */
export function canMakeDirectChanges(business: Business, playerId: string): boolean {
  const playerShare = getPlayerShare(business, playerId)
  return playerShare > 50
}

/**
 * Проверяет, требуется ли согласование для изменений (доля = 50%)
 * @returns true если доля = 50%
 */
export function requiresApproval(business: Business, playerId: string): boolean {
  const playerShare = getPlayerShare(business, playerId)
  return playerShare === 50
}

/**
 * Проверяет, может ли игрок вообще предлагать изменения
 * @returns true если доля >= 50%
 */
export function canProposeChanges(business: Business, playerId: string): boolean {
  const playerShare = getPlayerShare(business, playerId)
  return playerShare >= 50
}

/**
 * Получает долю игрока в бизнесе
 */
export function getPlayerShare(business: Business, playerId: string): number {
  // Если это партнёрский бизнес с playerShare
  if (business.playerShare !== undefined) {
    return business.playerShare
  }

  // Ищем в списке партнёров
  const partner = business.partners.find((p) => p.id === playerId)
  if (partner) {
    return partner.share
  }

  // Если партнёров нет, игрок владеет 100%
  if (business.partners.length === 0) {
    return 100
  }

  return 0
}

/**
 * Получает партнёра по бизнесу
 */
export function getBusinessPartner(business: Business, playerId: string) {
  console.log('[getBusinessPartner] Searching for partner:', {
    businessId: business.id,
    playerId,
    partnerId: business.partnerId,
    partnerName: business.partnerName,
    partnersCount: business.partners.length,
    partners: business.partners.map(p => ({ id: p.id, name: p.name, type: p.type }))
  })

  // Ищем в списке партнёров (приоритет)
  const partner = business.partners.find((p) => p.id !== playerId && p.type === 'player')
  if (partner) {
    console.log('[getBusinessPartner] Found partner in partners array:', partner)
    return {
      id: partner.id,
      name: partner.name,
      businessId: business.partnerBusinessId, // Используем partnerBusinessId из бизнеса
    }
  }

  // Если есть partnerId и это не текущий игрок (fallback)
  if (business.partnerId && business.partnerId !== playerId) {
    console.log('[getBusinessPartner] Found partner via partnerId:', business.partnerId)
    return {
      id: business.partnerId,
      name: business.partnerName || 'Партнёр',
      businessId: business.partnerBusinessId,
    }
  }

  console.log('[getBusinessPartner] No partner found')
  return null
}

/**
 * Проверяет, является ли изменение критичным (требует согласования даже при > 50%)
 */
export function isCriticalChange(changeType: BusinessChangeType): boolean {
  // Можно расширить список критичных изменений
  const criticalChanges: BusinessChangeType[] = ['freeze']
  return criticalChanges.includes(changeType)
}

/**
 * Генерирует ID для предложения изменения
 */
export function generateProposalId(): string {
  return `proposal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
