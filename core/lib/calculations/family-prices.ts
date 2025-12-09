/**
 * Layer 3: Family Activity Prices
 * 
 * Базовые цены для семейных активностей
 * Применяются с инфляцией через категорию 'services' (×0.9)
 */

/**
 * Базовые цены для семейных активностей
 */
export const FAMILY_PRICES = {
  // Поиск партнёра (свидания, знакомства)
  DATING_SEARCH: 200,
  DATING_ENERGY_COST: 30,
  
  // Питомцы (покупка)
  PET_DOG: 500,
  PET_CAT: 300,
  PET_HAMSTER: 50,
  
  // Ежеквартальные расходы
  PET_QUARTERLY_EXPENSES: 100,
  PARTNER_QUARTERLY_EXPENSES: 1500,
} as const

/**
 * Категория для семейных расходов
 * services (×0.9) - растут медленнее инфляции
 * 
 * Почему services?
 * - Свидания = услуги (рестораны, развлечения)
 * - Питомцы = услуги (ветеринар, уход)
 */
export const FAMILY_PRICE_CATEGORY = 'services' as const
