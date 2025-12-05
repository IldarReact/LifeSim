import { getItemCost, isRecurringItem } from '@/core/types/shop.types'
import { getShopItem } from '@/core/lib/shop-helpers'
import type { PlayerState } from '@/core/types'

export function calculateFoodExpenses(player: PlayerState, costModifier: number = 1.0): number {
  let total = 0
  const countryId = player.countryId

  // Еда игрока (обязательно)
  const playerFoodId = player.activeLifestyle?.food
  if (playerFoodId) {
    const item = getShopItem(playerFoodId, countryId)
    if (item) total += getItemCost(item) * costModifier
  }

  // Еда членов семьи
  player.personal.familyMembers.forEach(member => {
    if (member.type === 'pet') return
    const foodId = member.foodPreference
    if (foodId) {
      const item = getShopItem(foodId, countryId)
      if (item) total += getItemCost(item) * costModifier
    }
  })

  return Math.round(total)
}

export function calculateTransportExpenses(player: PlayerState, costModifier: number = 1.0): number {
  let total = 0
  const countryId = player.countryId

  // Транспорт игрока (обязательно)
  const playerTransportId = player.activeLifestyle?.transport
  if (playerTransportId) {
    const item = getShopItem(playerTransportId, countryId)
    if (item) total += getItemCost(item) * costModifier
  }

  // Транспорт членов семьи
  player.personal.familyMembers.forEach(member => {
    if (member.type === 'pet' || member.age < 10) return
    const transportId = member.transportPreference
    if (transportId) {
      const item = getShopItem(transportId, countryId)
      if (item) total += getItemCost(item) * costModifier
    }
  })

  return Math.round(total)
}

export function calculateHousingExpenses(player: PlayerState, costModifier: number = 1.0): number {
  const housingId = player.housingId
  if (!housingId) return 0

  const item = getShopItem(housingId, player.countryId)
  if (!item) return 0

  // Для рекуррентных (аренда) - costPerTurn
  // Для разовых (покупка) - maintenanceCost
  if (isRecurringItem(item)) {
    return item.costPerTurn * costModifier
  } else {
    return (item.maintenanceCost || 0) * costModifier
  }
}

export function calculateLifestyleExpenses(player: PlayerState, costModifier: number = 1.0) {
  const food = calculateFoodExpenses(player, costModifier)
  const transport = calculateTransportExpenses(player, costModifier)
  const housing = calculateHousingExpenses(player, costModifier)

  const credits = player.debts
    .filter(d => d.type !== 'mortgage')
    .reduce((sum, debt) => sum + debt.quarterlyInterest, 0)

  const mortgage = player.debts
    .filter(d => d.type === 'mortgage')
    .reduce((sum, debt) => sum + debt.quarterlyInterest, 0)

  const other = 0

  return {
    food,
    transport,
    housing,
    credits,
    mortgage,
    other,
    total: food + transport + housing + credits + mortgage + other
  }
}

export function calculateMemberExpenses(member: any, countryId?: string, costModifier: number = 1.0): number {
  let total = 0
  const foodId = member.foodPreference
  if (foodId) {
    const item = getShopItem(foodId, countryId)
    if (item) total += getItemCost(item) * costModifier
  }
  return total
}