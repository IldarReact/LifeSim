/**
 * Layer 5: Family Pricing Hook
 * 
 * UI хук для получения цен семейных активностей с учётом инфляции
 */

import { useMemo } from 'react'

import { useEconomy } from '@/core/hooks'
import { FAMILY_PRICES, FAMILY_PRICE_CATEGORY } from '@/core/lib/calculations/family-prices'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'

/**
 * Возвращает цены семейных активностей с учётом инфляции
 * 
 * @returns Объект с ценами, применёнными с инфляцией категории 'services'
 * 
 * @example
 * const prices = useFamilyPricing()
 * console.log(prices.datingSearch) // 205 (если инфляция 2.5%)
 */
export function useFamilyPricing() {
  const economy = useEconomy()
  
  return useMemo(() => {
    if (!economy) {
      return {
        datingSearch: FAMILY_PRICES.DATING_SEARCH,
        petDog: FAMILY_PRICES.PET_DOG,
        petCat: FAMILY_PRICES.PET_CAT,
        petHamster: FAMILY_PRICES.PET_HAMSTER,
        petQuarterlyExpenses: FAMILY_PRICES.PET_QUARTERLY_EXPENSES,
        partnerQuarterlyExpenses: FAMILY_PRICES.PARTNER_QUARTERLY_EXPENSES,
      }
    }
    
    return {
      datingSearch: getInflatedPrice(
        FAMILY_PRICES.DATING_SEARCH,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
      petDog: getInflatedPrice(
        FAMILY_PRICES.PET_DOG,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
      petCat: getInflatedPrice(
        FAMILY_PRICES.PET_CAT,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
      petHamster: getInflatedPrice(
        FAMILY_PRICES.PET_HAMSTER,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
      petQuarterlyExpenses: getInflatedPrice(
        FAMILY_PRICES.PET_QUARTERLY_EXPENSES,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
      partnerQuarterlyExpenses: getInflatedPrice(
        FAMILY_PRICES.PARTNER_QUARTERLY_EXPENSES,
        economy,
        FAMILY_PRICE_CATEGORY
      ),
    }
  }, [economy])
}
