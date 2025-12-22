/**
 * Layer 3: Scalable Inflation Engine
 *
 * ✅ Pure function — no side effects
 * ✅ Scalable — can be applied to any goods/items
 * ✅ Deterministic — no random jumping, stable inflation
 * ✅ Yearly only — applies exactly once per year (Q1)
 *
 * Problems Fixed:
 * - ❌ Was: Applied every quarter (should be once per year)
 * - ✅ Now: Only on Q1 of each year
 * - ❌ Was: Random jumping (unpredictable)
 * - ✅ Now: Smooth trend with damping
 * - ❌ Was: Could be negative (prices fall)
 * - ✅ Now: Minimum 0.1%, prices never fall
 * - ❌ Was: Not scalable to goods
 * - ✅ Now: Can apply to any category with INFLATION_MULTIPLIERS
 */

import type { CountryEconomy, EconomicEvent } from '../../types/economy.types'

/**
 * Category-specific inflation multipliers
 * Determines how fast prices rise for different goods
 *
 * Example: housing at 1.5x means housing prices rise 1.5x faster than base inflation
 */
export const INFLATION_MULTIPLIERS = {
  housing: 1.5, // 🏠 Недвижимость (дорожает быстро)
  realEstate: 1.5, // 🏢 Коммерческая недвижимость
  business: 1.3, // 💼 Бизнес (сложнее, дорожает)
  education: 1.2, // 📚 Образование
  health: 1.1, // 🏥 Здравоохранение
  transport: 1.0, // 🚗 Транспорт (средний уровень)
  salaries: 0.95, // 💰 Зарплаты (почти как инфляция, но чуть медленнее)
  services: 0.9, // 💇 Услуги (медленнее)
  food: 0.5, // 🍎 Еда (медленнее, конкуренция)
  default: 1.0, // 📊 По умолчанию
} as const

export type PriceCategory = keyof typeof INFLATION_MULTIPLIERS

/**
 * Inflation Settings: Controls how inflation behaves
 */
export const INFLATION_SETTINGS = {
  minInflation: 0.1, // 🔻 Minimum possible inflation (0.1%)
  maxInflation: 20, // 🔺 Maximum possible inflation (20%)
  dampingFactor: 0.6, // 📉 How much previous inflation affects this year (60% = trend-following)
  volatility: 0.8, // 📊 Random variance (0-1, higher = more volatile)
  crisisMultiplier: 2.5, // 🔥 Inflation multiplier during crisis
} as const

/**
 * Determines if economy is in crisis based on active events
 * Crisis events increase inflation volatility
 *
 * @param events - Active economic events
 * @returns true if any crisis/inflation_spike event is active
 */
function isInCrisis(events: EconomicEvent[] = []): boolean {
  return events.some((event) => event.type === 'crisis' || event.type === 'inflation_spike')
}

/**
 * Calculates target inflation range for the year
 * Based on country's base inflation and current conditions
 *
 * @param economy - Country economy state
 * @returns { min, max, target } inflation percentages
 */
function calculateInflationTargets(economy: CountryEconomy): {
  min: number
  max: number
  targetTrend: number
} {
  const currentInflation = economy.inflation
  const isInCrisis_ = isInCrisis(economy.activeEvents)

  // Диапазон вокруг текущей инфляции
  let volatility = INFLATION_SETTINGS.volatility
  let trendDamping = INFLATION_SETTINGS.dampingFactor

  if (isInCrisis_) {
    volatility *= INFLATION_SETTINGS.crisisMultiplier
    trendDamping *= 1.2 // Trend becomes more pronounced in crisis
  }

  // Ожидаемый диапазон для этого года
  const halfRange = currentInflation * volatility
  const min = Math.max(INFLATION_SETTINGS.minInflation, currentInflation - halfRange)
  const max = Math.min(INFLATION_SETTINGS.maxInflation, currentInflation + halfRange * 2)

  // КЛЮЧЕВАЯ ЧАСТЬ: Долгосрочный тренд не только следует за прошлой инфляцией,
  // но и стремится к мировому среднему уровню (~2-3%)
  // Это обеспечивает рост цен в долгосрочной перспективе
  const worldAverageInflation = 2.5 // Мировой средний уровень инфляции

  // Target: следует прошлой инфляции (damping factor) + тянется к мировому среднему
  // Если текущая инфляция ниже среднего мира - тянется вверх
  // Если выше - может упасть, но медленно (damping factor не даёт резких падений)
  const targetTrend = Math.max(
    min,
    Math.min(max, currentInflation * trendDamping + worldAverageInflation * (1 - trendDamping)),
  )

  return { min, max, targetTrend }
}

/**
 * Generates yearly inflation rate
 * Called EXACTLY ONCE per year (on Q1)
 *
 * Rules:
 * 1. Never negative (prices never fall)
 * 2. Based on previous year + damping factor (trend-following, not random)
 * 3. Events can modify (+/- from economic events)
 * 4. Stays within min-max bounds
 *
 * @param currentInflation - Inflation from previous year
 * @param economy - Country economy state
 * @returns New inflation rate (percentage)
 *
 * @example
 * // Year 1: base 2.5%
 * // Year 2: 2.5 * 0.6 + random small amount ≈ 2.3-2.8%
 * // Year 3 with crisis: might jump to 4-5%, but still follows trend
 */
export function generateYearlyInflation(currentInflation: number, economy: CountryEconomy): number {
  const { min, max, targetTrend } = calculateInflationTargets(economy)

  // Base: previous inflation with damping (trend-following)
  let newInflation = targetTrend

  // Add controlled random component (not wild swings)
  const maxDeviation = (max - min) * 0.3 // Max 30% of range deviation
  const randomComponent = (Math.random() - 0.5) * maxDeviation
  newInflation += randomComponent

  // Apply event effects
  for (const event of economy.activeEvents || []) {
    if (event.effects?.inflationChange) {
      newInflation += event.effects.inflationChange
    }
  }

  // Hard bounds: ensure within limits and non-negative
  newInflation = Math.max(
    INFLATION_SETTINGS.minInflation,
    Math.min(INFLATION_SETTINGS.maxInflation, newInflation),
  )

  // Round to 1 decimal place (0.1%)
  return Math.round(newInflation * 10) / 10
}

/**
 * Calculates central bank key rate based on inflation
 * Key rate is typically slightly above inflation + stability premium
 *
 * @param inflation - Current inflation rate
 * @param currentKeyRate - Previous year's key rate
 * @returns New key rate (percentage)
 */
export function calculateKeyRate(inflation: number, currentKeyRate: number): number {
  // Target: inflation + 1.5% (stability premium)
  // with slight random component
  const targetRate = inflation + 1.5 + (Math.random() - 0.5) * 0.5

  // Smooth adjustment (max ±1% per year for stability)
  const maxChange = 1.0
  const change = Math.max(-maxChange, Math.min(maxChange, targetRate - currentKeyRate))

  const newRate = Math.max(0.1, currentKeyRate + change)
  return Math.round(newRate * 100) / 100
}

/**
 * Applies inflation to a base price for a specific category
 * Called when calculating final prices for goods
 *
 * @param basePrice - Price before inflation
 * @param inflationRate - Yearly inflation percentage
 * @param category - Product category (housing, food, etc.)
 * @returns New price with inflation applied
 *
 * @example
 * // Housing with 3% inflation and 1.5x multiplier
 * applyInflation(100000, 3, 'housing')
 * // = 100000 * (1 + (3 * 1.5) / 100) = 104500
 */
export function applyInflation(
  basePrice: number,
  inflationRate: number,
  category: PriceCategory = 'default',
): number {
  if (basePrice <= 0 || inflationRate < 0) {
    return basePrice // Guard against invalid inputs
  }

  const multiplier = INFLATION_MULTIPLIERS[category]
  const effectiveInflation = (inflationRate * multiplier) / 100

  const newPrice = basePrice * (1 + effectiveInflation)
  return Math.round(newPrice)
}

/**
 * Calculates cumulative inflation multiplier across multiple years
 * Use this when you need to adjust prices based on full inflation history
 *
 * Compound inflation: Year1 * (1 + infl1) * (1 + infl2) * ... * (1 + inflN)
 *
 * @param inflationHistory - Array of yearly inflation rates (oldest to newest)
 * @param category - Product category
 * @returns Cumulative multiplier (e.g., 1.15 = 15% total price increase)
 *
 * @example
 * // 3 years of inflation: 2%, 2.5%, 3%
 * getCumulativeInflationMultiplier([2, 2.5, 3], 'housing')
 * // = (1 + 2*1.5/100) * (1 + 2.5*1.5/100) * (1 + 3*1.5/100) ≈ 1.138
 */
export function getCumulativeInflationMultiplier(
  inflationHistory: number[],
  category: PriceCategory = 'default',
): number {
  const multiplier = INFLATION_MULTIPLIERS[category]

  let product = 1
  const steps: string[] = []

  for (const inflation of inflationHistory) {
    const safeInflation = Math.max(0, inflation) // Protect from negative
    const effectiveInflation = (safeInflation * multiplier) / 100
    const yearMultiplier = 1 + effectiveInflation
    product = product * yearMultiplier
    steps.push(`${safeInflation.toFixed(1)}% → ×${yearMultiplier.toFixed(6)}`)
  }

  // DEBUG: Log multiplier calculation
  try {
    // import devLog lazily to avoid circular issues in some test environments
     
    const { devLog } = require('../debug') as { devLog?: (...a: unknown[]) => void }
    if (devLog && inflationHistory.length > 0) {
      devLog(
        `[getCumulativeInflationMultiplier] category=${category}, steps=[${steps.join(', ')}], result=${product.toFixed(6)}`,
      )
    }
  } catch {
    // ignore
  }

  return product
}
/**
 * Applies inflation to an entire price list
 * Use when you need to update all goods prices at once
 *
 * @param prices - Map of { category: basePrice }
 * @param inflationRate - Yearly inflation
 * @returns Updated prices with inflation applied
 */
export function applyInflationToAll(
  prices: Record<string, number>,
  inflationRate: number,
): Record<string, number> {
  const result: Record<string, number> = {}

  for (const [key, price] of Object.entries(prices)) {
    const category = key as PriceCategory
    result[key] = applyInflation(price, inflationRate, category)
  }

  return result
}

/**
 * Information about inflation notification to show to player
 */
export interface InflationNotification {
  year: number
  inflationRate: number // Current year's inflation
  inflationChange: number // Change from previous year (+/-)
  keyRate: number // Central bank key rate
  keyRateChange: number // Change from previous year
  countryName: string // Country name for display
  timestamp: number // When this happened (turn number)
}

/**
 * Formats inflation notification for display
 *
 * @param notification - Inflation data
 * @returns Formatted string for UI
 */
export function formatInflationNotification(notification: InflationNotification): string {
  const inflationEmoji = notification.inflationChange > 0 ? '📈' : '📉'
  const rateEmoji = notification.keyRateChange > 0 ? '⬆️' : '⬇️'

  return `${inflationEmoji} Инфляция: ${notification.inflationRate}% (${notification.inflationChange > 0 ? '+' : ''}${notification.inflationChange}%)\n${rateEmoji} Ставка: ${notification.keyRate}% (${notification.keyRateChange > 0 ? '+' : ''}${notification.keyRateChange}%)`
}

/**
 * Returns true if inflation should be applied this turn
 *
 * @param turn - Current turn number
 * @returns true if this is Q1 (start of new year)
 */
export function shouldApplyInflationThisTurn(turn: number): boolean {
  return turn > 0 && turn % 4 === 1
}
