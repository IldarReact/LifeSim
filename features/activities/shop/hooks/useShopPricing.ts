import {
  getInflatedShopPrice,
  getInflatedHousingPrice,
} from '@/core/lib/calculations/price-helpers'
import { CountryEconomy, ShopCategory, ShopItem } from '@/core/types'
import { getItemCost, isRecurringItem } from '@/core/types/shop.types'

interface ShopPricing {
  displayPrice: number
  canAfford: boolean
  isRecurring: boolean
}

export function useShopPricing(
  item: ShopItem,
  category: ShopCategory,
  country: CountryEconomy | undefined,
  playerMoney: number,
): ShopPricing {
  const baseCost = getItemCost(item)
  const isRecurring = isRecurringItem(item)

  if (!country) {
    return {
      displayPrice: baseCost,
      canAfford: playerMoney >= baseCost,
      isRecurring,
    }
  }

  let displayPrice = baseCost

  if (category === 'housing' && item.price) {
    displayPrice = getInflatedHousingPrice(item.price, country)
  } else {
    const priceToInflate = item.price || baseCost
    displayPrice = getInflatedShopPrice(priceToInflate, country, category)
  }

  return {
    displayPrice,
    canAfford: playerMoney >= displayPrice,
    isRecurring,
  }
}
