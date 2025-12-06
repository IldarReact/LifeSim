// Хелперы для расчета цен с учетом инфляции
import type { CountryEconomy } from '@/core/types/economy.types'
import { applyInflationToPrice, type PriceCategory } from './inflation-system'

/**
 * Универсальная функция для получения цены с учетом инфляции
 * @param basePrice - Базовая цена из JSON
 * @param economy - Экономика страны
 * @param category - Категория товара (housing, food, education и т.д.)
 * @param baseYear - Базовый год (по умолчанию год начала игры)
 * @param currentYear - Текущий год игры
 * @returns Цена с учетом накопленной инфляции
 */
export function getInflatedPrice(
  basePrice: number,
  economy: CountryEconomy,
  category: PriceCategory = 'default',
  baseYear?: number,
  currentYear?: number,
): number {
  const base = baseYear ?? economy.baseYear ?? 2024
  // Если currentYear не передан, вычисляем из истории инфляции
  // История содержит базовый год + все последующие годы с инфляцией
  // Если история [3.1, 3.5, 4.0], то это годы: 2024 (базовый), 2025, 2026
  // Значит текущий год = базовый + (длина истории - 1)
  // Но если история пустая или содержит только базовый год, используем базовый год
  const historyLength = economy.inflationHistory?.length ?? 1
  const current = currentYear ?? (historyLength > 1 ? base + (historyLength - 1) : base)

  const price = applyInflationToPrice(basePrice, economy, category, base, current)

  // Отладочный лог INFLATION_DEBUG_PRICE отключен
  // eslint-disable-next-line no-console
  // console.log('[INFLATION_DEBUG_PRICE]', {
  //   category,
  //   basePrice,
  //   baseYear: base,
  //   currentYear: current,
  //   inflationHistory: economy.inflationHistory,
  //   currentInflation: economy.inflation,
  //   resultPrice: price,
  // })

  return price
}

/**
 * Получает цену жилья с учетом инфляции
 * Жилье растет быстрее инфляции (multiplier 1.5)
 */
export function getInflatedHousingPrice(
  basePrice: number,
  economy: CountryEconomy,
  baseYear?: number,
  currentYear?: number,
): number {
  return getInflatedPrice(basePrice, economy, 'housing', baseYear, currentYear)
}

/**
 * Получает цену курса/образования с учетом инфляции
 * Образование растет быстрее инфляции (multiplier 1.2)
 */
export function getInflatedEducationPrice(
  basePrice: number,
  economy: CountryEconomy,
  baseYear?: number,
  currentYear?: number,
): number {
  return getInflatedPrice(basePrice, economy, 'education', baseYear, currentYear)
}

/**
 * Получает цену товара в магазине с учетом инфляции
 * @param category - Категория товара (food, health, services, transport, default)
 */
export function getInflatedShopPrice(
  basePrice: number,
  economy: CountryEconomy,
  category: PriceCategory = 'default',
  baseYear?: number,
  currentYear?: number,
): number {
  return getInflatedPrice(basePrice, economy, category, baseYear, currentYear)
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
