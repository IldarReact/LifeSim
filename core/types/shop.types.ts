import { AssetType } from "./finance.types"
import { StatEffect } from "./stats.types"

export type ShopCategory =
  | 'food'
  | 'transport'
  | 'health'
  | 'services'
  | 'housing'

/** Базовый интерфейс */
export interface BaseShopItem {
  id: string
  name: string
  description?: string
  category: ShopCategory
  effects?: StatEffect
}

/** Разовая покупка (машина, гаджет, подарок) */
export interface OneTimeShopItem extends BaseShopItem {
  price: number
  isRecurring?: never
  costPerTurn?: never

  // Для активов (машины, недвижимость и т.д.)
  assetType?: AssetType
  maintenanceCost?: number
}

/** Рекуррентная подписка (еда, транспорт, жильё, Netflix) */
export interface RecurringShopItem extends BaseShopItem {
  isRecurring: true
  costPerTurn: number
  price?: never
}

/** Главный тип */
export type ShopItem = OneTimeShopItem | RecurringShopItem

export function isRecurringItem(item: ShopItem): item is RecurringShopItem {
  return (item as RecurringShopItem).isRecurring === true
}

export function getItemCost(item: ShopItem): number {
  return isRecurringItem(item) ? item.costPerTurn : item.price
}