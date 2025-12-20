/**
 * Centralized inflation hook for UI components
 * Automatically applies inflation based on item type
 */

import { useMemo } from 'react'

import {
  getInflatedPrice,
  getInflatedHousingPrice,
  getInflatedEducationPrice,
  getInflatedShopPrice,
  getInflatedBaseSalary
} from '@/core/lib/calculations/price-helpers'
import { useGameStore } from '@/core/model/game-store'
import type { CountryEconomy } from '@/core/types/economy.types'

// Type guards для автоопределения категории
type PriceableItem =
  | { category: 'housing'; price?: number; costPerTurn?: number }
  | { category: 'education'; price: number }
  | { category: 'shop' | 'food' | 'health' | 'services'; price?: number; costPerTurn?: number }
  | { category: 'business'; price: number }
  | { category: 'transport'; price?: number; costPerTurn?: number }
  | { salary: number } // Для зарплат
  | { price?: number; costPerTurn?: number; category?: string } // Fallback

/**
 * Main hook - автоматически применяет инфляцию
 */
export function useInflatedPrice(item: PriceableItem): number {
  const economy = useGameStore(state => {
    if (!state.countries || !state.player?.countryId) return undefined
    return state.countries[state.player.countryId]
  })

  return useMemo(() => {
    // Salary (for job vacancies)
    if ('salary' in item) {
      return economy ? getInflatedBaseSalary(item.salary, economy) : item.salary
    }

    // Get base price (handle recurring items)
    const basePrice = ('costPerTurn' in item && item.costPerTurn) 
      ? item.costPerTurn 
      : ('price' in item && item.price) 
        ? item.price 
        : 0
    
    if (!basePrice) return 0
    if (!economy) return basePrice

    const category = item.category

    switch (category) {
      case 'housing':
        return getInflatedHousingPrice(basePrice, economy)
      case 'education':
        return getInflatedEducationPrice(basePrice, economy)
      case 'food':
        return getInflatedShopPrice(basePrice, economy, 'food')
      case 'health':
        return getInflatedShopPrice(basePrice, economy, 'health')
      case 'services':
        return getInflatedShopPrice(basePrice, economy, 'services')
      case 'transport':
        return getInflatedShopPrice(basePrice, economy, 'transport')
      case 'business':
        return getInflatedPrice(basePrice, economy, 'business')
      default:
        return getInflatedPrice(basePrice, economy)
    }
  }, [item, economy])
}

/**
 * Hook для массива items (списки товаров)
 */
export function useInflatedPrices<T extends PriceableItem>(
  items: T[]
): Array<T & { inflatedPrice: number }> {
  const economy = useGameStore(state => {
    if (!state.countries || !state.player?.countryId) return undefined
    return state.countries[state.player.countryId]
  })

  return useMemo(() => {
    if (!economy) return items.map(item => ({ 
      ...item, 
      inflatedPrice: 'salary' in item 
        ? item.salary 
        : ('costPerTurn' in item && item.costPerTurn) 
          ? item.costPerTurn 
          : ('price' in item && item.price) 
            ? item.price 
            : 0
    }))

    return items.map(item => ({
      ...item,
      inflatedPrice: calculateInflatedPrice(item, economy)
    }))
  }, [items, economy])
}

/**
 * Hook для прямого доступа к economy (если нужна кастомная логика)
 */
export function useEconomy(): CountryEconomy | undefined {
  return useGameStore(state => {
    if (!state.countries || !state.player?.countryId) return undefined
    return state.countries[state.player.countryId]
  })
}

// Helper для массивов
function calculateInflatedPrice(item: PriceableItem, economy: CountryEconomy): number {
  if ('salary' in item) {
    return getInflatedBaseSalary(item.salary, economy)
  }

  const basePrice = ('costPerTurn' in item && item.costPerTurn) 
    ? item.costPerTurn 
    : ('price' in item && item.price) 
      ? item.price 
      : 0
  
  if (!basePrice) return 0

  const category = item.category

  switch (category) {
    case 'housing':
      return getInflatedHousingPrice(basePrice, economy)
    case 'education':
      return getInflatedEducationPrice(basePrice, economy)
    case 'food':
      return getInflatedShopPrice(basePrice, economy, 'food')
    case 'health':
      return getInflatedShopPrice(basePrice, economy, 'health')
    case 'services':
      return getInflatedShopPrice(basePrice, economy, 'services')
    case 'transport':
      return getInflatedShopPrice(basePrice, economy, 'transport')
    case 'business':
      return getInflatedPrice(basePrice, economy, 'business')
    default:
      return getInflatedPrice(basePrice, economy)
  }
}
