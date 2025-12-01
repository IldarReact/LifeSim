import type { StatEffect } from './stats.types'
import type { AssetType } from './finance.types'

export type ShopCategory = 'food' | 'transport' | 'health' | 'services' | 'real_estate' | 'luxury'

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  category: ShopCategory

  // Эффекты при покупке (разовые)
  effects?: StatEffect

  // Если это актив (машина, дом)
  assetType?: AssetType
  maintenanceCost?: number // Ежемесячное обслуживание

  // Требования
  minMoney?: number

  // Ограничения
  maxQuantity?: number // Например, нельзя купить 2 одинаковые машины (условно)
  cooldown?: number // Кулдаун в ходах (пока не используется, на будущее)

  // Рекуррентные платежи (лайфстайл)
  isRecurring?: boolean
  costPerTurn?: number
}
