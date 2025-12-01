import { SHOP_ITEMS } from './shop-data'
import type { ShopItem, ShopCategory } from '@/core/types/shop.types'

/**
 * Получить товар по ID
 */
export function getShopItem(itemId: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === itemId)
}

/**
 * Получить все товары категории
 */
export function getShopItemsByCategory(category: ShopCategory): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.category === category)
}

/**
 * Получить рекуррентные товары категории (для lifestyle)
 */
export function getRecurringItemsByCategory(category: ShopCategory): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.category === category && item.isRecurring)
}

/**
 * Рассчитать квартальную стоимость lifestyle предмета
 */
export function getLifestyleCost(itemId: string): number {
  const item = getShopItem(itemId)
  if (!item || !item.isRecurring) return 0
  return item.costPerTurn || item.price
}

/**
 * Получить дефолтный товар для категории
 */
export function getDefaultLifestyleItem(category: ShopCategory): ShopItem | undefined {
  const defaults: Record<ShopCategory, string> = {
    food: 'food_homemade',
    real_estate: 'housing_room',
    transport: 'transport_bike',
    health: '',
    services: '',
    luxury: ''
  }

  const defaultId = defaults[category]
  return defaultId ? getShopItem(defaultId) : undefined
}
