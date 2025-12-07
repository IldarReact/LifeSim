// src/shared/data/loaders/transport-loader.ts
import type { ShopItem } from '@/core/types/shop.types'

import usTransport from '@/shared/data/world/countries/us/transport.json'
import geTransport from '@/shared/data/world/countries/germany/transport.json'
import brTransport from '@/shared/data/world/countries/brazil/transport.json'

function validate(item: unknown): item is ShopItem {
  const i = item as ShopItem
  return !!(i.id && i.name && i.category === 'transport')
}

const COUNTRY_TRANSPORT: Record<string, ShopItem[]> = {
  us: usTransport.filter(validate) as ShopItem[],
  ge: geTransport.filter(validate) as ShopItem[],
  br: brTransport.filter(validate) as ShopItem[],
}

export function getTransportOptions(countryId: string = 'us'): ShopItem[] {
  return COUNTRY_TRANSPORT[countryId] ?? []
}