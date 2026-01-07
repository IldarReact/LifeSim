import type { Business, BusinessProposal, BusinessPartner } from '@/core/types/business.types'

/**
 * Рассчитывает голос NPC по предложению
 */
export function calculateNPCVote(
  proposal: BusinessProposal,
  business: Business,
  partner: BusinessPartner,
  marketPrice: number = 5, // Базовая рыночная цена
): boolean {
  // Если отношение плохое, голосует против из вредности (с вероятностью 30%)
  if (partner.relation < 30 && Math.random() < 0.3) {
    return false
  }

  switch (proposal.changeType) {
    case 'price':
      const newPrice = proposal.data.newPrice || business.price

      // Если цена в разумных пределах (4-8), то скорее всего ЗА
      if (newPrice >= 4 && newPrice <= 8) return true

      // Если эффективность низкая, нужны перемены -> ЗА
      if (business.efficiency < 40) return true

      // Если эффективность высокая и цена растет -> ЗА (капитализация успеха)
      if (business.efficiency > 80 && newPrice > business.price) return true

      return false

    case 'quantity':
      const newQuantity = proposal.data.newQuantity || 0
      const currentStock = business.inventory?.currentStock || 0
      const maxStock = business.inventory?.maxStock || 1000

      // Если склад почти полон (>80%) и мы снижаем производство -> ЗА
      if (currentStock > maxStock * 0.8 && newQuantity < business.quantity) return true

      // Если склад почти пуст (<20%) и мы повышаем производство -> ЗА
      if (currentStock < maxStock * 0.2 && newQuantity > business.quantity) return true

      // В остальных случаях NPC консервативен, если изменение резкое (>50%)
      const changePercent = Math.abs(newQuantity - business.quantity) / (business.quantity || 1)
      if (changePercent > 0.5) return false

      return true

    case 'branch':
      // NPC всегда за расширение, если есть деньги
      return true

    case 'dividend':
      // Если денег много, то ЗА
      return true

    default:
      return false
  }
}
