import { getInflatedHousingPrice } from '@/core/lib/calculations/price-helpers'
import type { CountryEconomy } from '@/core/types/economy.types'
import type { ShopItem } from '@/core/types/shop.types'
import { isRecurringItem } from '@/core/types/shop.types'

export function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) return '$0'
  return `$${price.toLocaleString('ru-RU')}`
}

export function getHousingTypeLabel(
  item: ShopItem,
  country: CountryEconomy | undefined,
): string {
  if (isRecurringItem(item)) {
    return 'Аренда'
  }

  if (item.price && country) {
    const adjustedPrice = getInflatedHousingPrice(item.price, country)
    return `Покупка за ${formatPrice(adjustedPrice)}`
  }

  return 'Жильё'
}
