import type { ShopItem } from '@/core/types/shop.types'
import { isRecurringItem } from '@/core/types/shop.types'
import type { CountryEconomy } from '@/core/types/economy.types'
import { getInflatedHousingPrice } from '@/core/lib/calculations/price-helpers'

export function formatPrice(price: number): string {
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
