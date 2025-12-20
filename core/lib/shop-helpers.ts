import { getShopItemById, getShopItemsByCategory as getItemsByCategory } from '@/core/lib/data-loaders/shop-loader'
import { getItemCost, isRecurringItem, } from '@/core/types/shop.types'
import type { ShopItem, ShopCategory } from '@/core/types/shop.types'

/**
 * Получить товар по ID
 */
export function getShopItem(itemId: string, countryId?: string): ShopItem | undefined {
  return getShopItemById(itemId, countryId)
}

/**
 * Получить все товары категории
 */
export function getShopItemsByCategory(category: ShopCategory, countryId?: string): ShopItem[] {
  return getItemsByCategory(category, countryId)
}

/**
 * Получить рекуррентные товары категории (для lifestyle)
 */
export function getRecurringItemsByCategory(category: ShopCategory, countryId?: string): ShopItem[] {
  const items = getShopItemsByCategory(category, countryId)
  return items.filter(isRecurringItem)
}

/**
 * Рассчитать квартальную стоимость lifestyle предмета
 */
export function getLifestyleCost(itemId: string, countryId?: string): number {
  const item = getShopItem(itemId, countryId)
  return item ? getItemCost(item) : 0
}

/**
 * Получить дефолтный товар для категории
 */
export function getDefaultLifestyleItem(category: ShopCategory, countryId?: string): ShopItem | undefined {
  const defaults: Record<ShopCategory, string> = {
    food: 'food_homemade',
    housing: 'housing_room',
    transport: 'transport_public',
    health: '',
    services: ''
  }

  const defaultId = defaults[category]
  return defaultId ? getShopItem(defaultId, countryId) : undefined
}
