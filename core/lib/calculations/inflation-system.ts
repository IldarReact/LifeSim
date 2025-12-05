// Система управления инфляцией и ценами
import type { CountryEconomy } from '@/core/types/economy.types'

/**
 * Коэффициенты роста цен для разных категорий товаров
 * Жильё растёт быстрее, еда медленнее
 */
export const INFLATION_MULTIPLIERS = {
  housing: 1.5,        // Недвижимость растёт на 150% от инфляции
  realEstate: 1.5,     // Недвижимость
  business: 1.3,       // Бизнес
  education: 1.2,      // Образование
  health: 1.1,         // Здравоохранение
  transport: 1.0,      // Транспорт
  services: 0.9,       // Услуги
  food: 0.7,           // Еда растёт медленнее
  default: 1.0,        // По умолчанию
} as const

export type PriceCategory = keyof typeof INFLATION_MULTIPLIERS

/**
 * Генерирует случайную инфляцию для страны
 * @param countryId - ID страны
 * @param currentInflation - Текущая инфляция
 * @param isCrisis - Флаг кризиса
 * @returns Новая инфляция в процентах
 */
export function generateYearlyInflation(
  countryId: string,
  currentInflation: number,
  isCrisis: boolean = false
): number {
  // Базовые диапазоны для разных стран
  const inflationRanges: Record<string, { min: number; max: number }> = {
    us: { min: 1, max: 5 },
    germany: { min: 1, max: 4 },
    brazil: { min: 3, max: 9 },
  }

  const range = inflationRanges[countryId] || { min: 1, max: 6 }

  // Случайное изменение инфляции
  const randomChange = (Math.random() - 0.5) * 2 // от -1 до +1

  // Во время кризиса инфляция может резко вырасти
  const crisisBonus = isCrisis ? Math.random() * 5 : 0

  // Новая инфляция
  let newInflation = currentInflation + randomChange + crisisBonus

  // Ограничиваем диапазоном
  newInflation = Math.max(range.min, Math.min(range.max, newInflation))

  return Math.round(newInflation * 10) / 10 // Округляем до 1 знака
}

/**
 * Рассчитывает новую ключевую ставку на основе инфляции
 * Ключевая ставка обычно немного выше инфляции
 */
export function calculateKeyRate(inflation: number, currentKeyRate: number): number {
  const targetKeyRate = inflation + 1.5 + (Math.random() - 0.5) * 0.5

  // Плавное изменение ключевой ставки (не более ±2% за раз)
  const change = Math.max(-2, Math.min(2, targetKeyRate - currentKeyRate))

  return Math.max(0.1, Math.round((currentKeyRate + change) * 100) / 100)
}

/**
 * Применяет инфляцию к цене
 * @param basePrice - Базовая цена
 * @param inflationRate - Годовая инфляция в процентах
 * @param category - Категория товара
 * @returns Новая цена с учётом инфляции
 */
export function applyInflation(
  basePrice: number,
  inflationRate: number,
  category: PriceCategory = 'default'
): number {
  const multiplier = INFLATION_MULTIPLIERS[category]
  const effectiveInflation = inflationRate * multiplier / 100

  return Math.round(basePrice * (1 + effectiveInflation))
}

/**
 * Применяет инфляцию к экономике страны за год
 */
export function applyYearlyInflation(
  economy: CountryEconomy,
  isCrisis: boolean = false
): {
  newEconomy: CountryEconomy
  inflationChange: number
  keyRateChange: number
} {
  const oldInflation = economy.inflation
  const oldKeyRate = economy.keyRate

  const newInflation = generateYearlyInflation(economy.id, oldInflation, isCrisis)
  const newKeyRate = calculateKeyRate(newInflation, oldKeyRate)

  const inflationChange = Math.round((newInflation - oldInflation) * 10) / 10
  const keyRateChange = Math.round((newKeyRate - oldKeyRate) * 100) / 100

  return {
    newEconomy: {
      ...economy,
      inflation: newInflation,
      keyRate: newKeyRate,
      costOfLivingModifier: economy.costOfLivingModifier * (1 + newInflation / 100)
    },
    inflationChange,
    keyRateChange,
  }
}

/**
 * Проверяет, нужно ли показать уведомление об инфляции
 * Показываем раз в год (каждые 4 квартала)
 */
export function shouldShowInflationNotification(currentTurn: number): boolean {
  return currentTurn > 0 && currentTurn % 4 === 0
}
