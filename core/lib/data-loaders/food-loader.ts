import type { ShopItem } from '@/core/types/shop.types'
import brFood from '@/shared/data/world/countries/brazil/shop-categories/food.json'
import geFood from '@/shared/data/world/countries/germany/shop-categories/food.json'
import usFood from '@/shared/data/world/countries/us/shop-categories/food.json'

const COUNTRY_FOOD: Record<string, ShopItem[]> = {
  us: usFood as unknown as ShopItem[],
  ge: geFood as unknown as ShopItem[],
  br: brFood as unknown as ShopItem[],
}

export function getFoodOptions(countryId: string = 'us'): ShopItem[] {
  return COUNTRY_FOOD[countryId] ?? []
}

export const DEFAULT_FOOD_ID = 'food_basic'; //fix