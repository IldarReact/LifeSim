import { ShopItem } from '@/core/types/shop.types'

// Country imports
// USA
import brHousing from '@/shared/data/world/countries/brazil/housing.json'
import brFood from '@/shared/data/world/countries/brazil/shop-categories/food.json'
import brHealth from '@/shared/data/world/countries/brazil/shop-categories/health.json'
import brServices from '@/shared/data/world/countries/brazil/shop-categories/services.json'
import brTransport from '@/shared/data/world/countries/brazil/transport.json'
import geHousing from '@/shared/data/world/countries/germany/housing.json'
import geFood from '@/shared/data/world/countries/germany/shop-categories/food.json'
import geHealth from '@/shared/data/world/countries/germany/shop-categories/health.json'
import geTransport from '@/shared/data/world/countries/germany/transport.json'
import usHousing from '@/shared/data/world/countries/us/housing.json'
import usFood from '@/shared/data/world/countries/us/shop-categories/food.json'
import usTransport from '@/shared/data/world/countries/us/transport.json'
import usHealth from '@/shared/data/world/countries/us/shop-categories/health.json'
import usServices from '@/shared/data/world/countries/us/shop-categories/services.json'


// Germany
import geServices from '@/shared/data/world/countries/germany/shop-categories/services.json'


// Brazil


/**
 * Type-safe data loaders with runtime validation
 */

function validateShopItem(item: unknown): item is ShopItem {
  const i = item as any

  if (!i.id || !i.name || !i.category) return false

  // Если это подписка — нужен costPerTurn
  if (i.isRecurring === true) {
    return typeof i.costPerTurn === 'number' && i.costPerTurn >= 0
  }

  // Иначе — нужен price
  return typeof i.price === 'number' && i.price >= 0
}

function loadAndValidate(data: unknown[], source: string): ShopItem[] {
  const validated: ShopItem[] = []

  for (const item of data) {
    if (validateShopItem(item)) {
      validated.push(item)
    } else {
      // fix1
      // console.error(`Invalid item in ${source}:`, item)
      // throw new Error(`Data validation failed for ${source}`)
    }
  }

  return validated
}

// Country Data Registry - ALL data is country-specific
const COUNTRY_DATA: Record<string, ShopItem[]> = {
  germany: [
    ...loadAndValidate(geFood, 'germany/food.json'),
    ...loadAndValidate(geTransport, 'germany/transport.json'),
    ...loadAndValidate(geHealth, 'germany/health.json'),
    ...loadAndValidate(geServices, 'germany/services.json'),
    ...loadAndValidate(geHousing, 'germany/housing.json')
  ],
  us: [
    ...loadAndValidate(usFood, 'us/food.json'),
    ...loadAndValidate(usTransport, 'us/transport.json'),
    ...loadAndValidate(usHealth, 'us/health.json'),
    ...loadAndValidate(usServices, 'us/services.json'),
    ...loadAndValidate(usHousing, 'us/housing.json')
  ],
  brazil: [
    ...loadAndValidate(brFood, 'brazil/food.json'),
    ...loadAndValidate(brTransport, 'brazil/transport.json'),
    ...loadAndValidate(brHealth, 'brazil/health.json'),
    ...loadAndValidate(brServices, 'brazil/services.json'),
    ...loadAndValidate(brHousing, 'brazil/housing.json')
  ]
}

// Get items for specific country (NO fallback to commons)
function getCountryItems(countryId: string): ShopItem[] {
  if (!COUNTRY_DATA[countryId]) {
    console.error(`No data found for country: ${countryId}`)
    return []
  }
  return COUNTRY_DATA[countryId]
}

// Export for backward compatibility (defaults to US)
export const ALL_SHOP_ITEMS = COUNTRY_DATA.us || []

// Helper to get item by ID
export function getShopItemById(id: string, countryId: string = 'us'): ShopItem | undefined {
  const items = getCountryItems(countryId)
  return items.find(item => item.id === id)
}

// Helper to get items by category
export function getShopItemsByCategory(category: string, countryId: string = 'us'): ShopItem[] {
  const items = getCountryItems(countryId)
  return items.filter(item => item.category === category)
}

// Helper to get all items for a country
export function getAllItemsForCountry(countryId: string): ShopItem[] {
  return getCountryItems(countryId)
}
