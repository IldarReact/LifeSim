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
  // Если есть partnerId и это не текущий игрок
  if (business.partnerId && business.partnerId !== playerId) {
    return {
      id: business.partnerId,
      name: business.partnerName || 'Партнёр',
      businessId: business.partnerBusinessId,
    }
  }

  // Ищем в списке партнёров
  const partner = business.partners.find((p) => p.id !== playerId && p.type === 'player')
  if (partner) {
    return {
      id: partner.id,
      name: partner.name,
      businessId: undefined, // Нужно будет получить из другого источника
    }
  }

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
