// Хелперы для расчета цен с учетом инфляции
import type { CountryEconomy } from '@/core/types/economy.types'
import {
  getCumulativeInflationMultiplier,
  type PriceCategory,
  INFLATION_MULTIPLIERS,
} from './inflation-engine'
import { devLog } from '../debug'

/**
 * Универсальная функция для получения цены с учетом инфляции
 * Использует новый scalable inflation engine с категорийными мультипликаторами
 *
 * @param basePrice - Базовая цена из JSON
 * @param economy - Экономика страны
 * @param category - Категория товара (housing, food, education и т.д.)
 * @returns Цена с учетом накопленной инфляции
 */
export function getInflatedPrice(
  basePrice: number,
  economy: CountryEconomy,
  category: PriceCategory = 'default',
): number {
  if (!basePrice || basePrice <= 0) {
    return basePrice
  }

  // Берем историю инфляции из экономики (хранится новые->старые)
  const inflationHistory = economy.inflationHistory || []

  // Если истории нет - используем базовую цену (еще не было инфляции)
  if (inflationHistory.length === 0) {
    return basePrice
  }

  // Даже если история содержит только текущую инфляцию - применяем её!
  // История: [2.5] означает что текущий год имеет 2.5% инфляцию
  // Мы должны применить эту инфляцию к цене (не пропускать!)

  // Рассчитываем кумулятивный мультипликатор инфляции
  // История хранится обратно: [current, year-1, year-2, ...]
  // Реверсируем чтобы получить хронологический порядок
  const chronologicalHistory = [...inflationHistory].reverse()

  // DEBUG: Log inflation history for debugging price falls (development only)
  if (basePrice > 500) {
    devLog('[getInflatedPrice] base=', basePrice, 'category=', category, {
      historyAsStored: inflationHistory,
      historyReversed: chronologicalHistory,
      categoryMultiplier: INFLATION_MULTIPLIERS[category],
    })
  }

  // Применяем мультипликатор с учетом категории
  const cumulativeMultiplier = getCumulativeInflationMultiplier(chronologicalHistory, category)

  const inflatedPrice = Math.round(basePrice * cumulativeMultiplier)

  if (basePrice > 500) {
    devLog(
      `[getInflatedPrice] result: ${basePrice} * ${cumulativeMultiplier.toFixed(6)} = ${inflatedPrice}`,
    )
  }

  return inflatedPrice
}

/**
 * Получает цену жилья с учетом инфляции
 * Жилье растет быстрее инфляции (multiplier 1.5)
 */
export function getInflatedHousingPrice(basePrice: number, economy: CountryEconomy): number {
  return getInflatedPrice(basePrice, economy, 'housing')
}

/**
 * Получает цену курса/образования с учетом инфляции
 * Образование растет быстрее инфляции (multiplier 1.2)
 */
export function getInflatedEducationPrice(basePrice: number, economy: CountryEconomy): number {
  return getInflatedPrice(basePrice, economy, 'education')
}

/**
 * Получает цену товара в магазине с учетом инфляции
 * @param category - Категория товара (food, health, services, transport, default)
 */
export function getInflatedShopPrice(
  basePrice: number,
  economy: CountryEconomy,
  category: PriceCategory = 'default',
): number {
  return getInflatedPrice(basePrice, economy, category)
}

/**
 * Получает базовую зарплату с учетом инфляции
 * Зарплаты растут почти как инфляция (multiplier 0.95)
 */
export function getInflatedBaseSalary(baseSalary: number, economy: CountryEconomy): number {
  return getInflatedPrice(baseSalary, economy, 'salaries')
}

/**
 * Рассчитывает индексированную зарплату с учетом инфляции
 * В реальном мире зарплаты индексируются на 70-90% от инфляции
 * @param baseSalary - Базовая зарплата (при устройстве на работу)
 * @param economy - Экономика страны
 * @param quartersPassed - Количество прошедших кварталов с момента устройства
 * @returns Индексированная зарплата
 */
export function getInflatedSalary(
  baseSalary: number,
  economy: CountryEconomy,
  quartersPassed: number = 0,
): number {
  if (quartersPassed <= 0) {
    return baseSalary
  }

  const inflationHistory = economy.inflationHistory || [economy.inflation]

  // Индексация происходит раз в год (каждые 4 квартала)
  const yearsPassed = Math.floor(quartersPassed / 4)

  if (yearsPassed <= 0) {
    return baseSalary
  }

  // Берем историю инфляции за прошедшие годы
  const relevantHistory = inflationHistory.slice(-yearsPassed - 1)

  // Коэффициент индексации: 70-90% от инфляции (как в реальном мире)
  const indexationRate = 0.7 + Math.random() * 0.2 // 0.7-0.9

  // Рассчитываем накопленную индексацию
  let indexedSalary = baseSalary
  for (const yearlyInflation of relevantHistory.slice(1)) {
    // Пропускаем первый год (базовый)
    const yearlyIndexation = (yearlyInflation * indexationRate) / 100
    indexedSalary = indexedSalary * (1 + yearlyIndexation)
  }

  return Math.round(indexedSalary)
}

/**
 * Рассчитывает квартальную зарплату с учетом индексации
 * Используется для отображения текущей зарплаты игрока
 */
export function getQuarterlyInflatedSalary(
  baseQuarterlySalary: number,
  economy: CountryEconomy,
  quartersPassed: number = 0,
): number {
  // Квартальная зарплата = месячная * 3, индексация применяется к месячной
  const baseMonthlySalary = baseQuarterlySalary / 3
  const indexedMonthlySalary = getInflatedSalary(baseMonthlySalary, economy, quartersPassed)

  return Math.round(indexedMonthlySalary * 3)
}
