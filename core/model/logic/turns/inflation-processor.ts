import type { CountryEconomy } from '@/core/types'
import type { Notification } from '@/core/types'
import {
  shouldApplyInflationThisTurn,
  generateYearlyInflation,
  calculateKeyRate,
  formatInflationNotification,
  type InflationNotification,
} from '@/core/lib/calculations/inflation-engine'

/**
 * Process yearly inflation for the player's country when appropriate.
 * Returns possibly-updated countries map and a ready-to-push notification.
 */
export function processInflation(
  countries: Record<string, CountryEconomy>,
  playerCountryId: string,
  newTurn: number,
  newYear: number,
): {
  updatedCountries: Record<string, CountryEconomy>
  inflationNotification: InflationNotification | null
  notification?: Notification
} {
  let updatedCountries = countries
  let inflationNotification: InflationNotification | null = null
  let notification: Notification | undefined

  const country = countries[playerCountryId]
  if (!country) return { updatedCountries, inflationNotification }

  if (!shouldApplyInflationThisTurn(newTurn)) return { updatedCountries, inflationNotification }

  const newInflation = generateYearlyInflation(country.inflation, country)
  const newKeyRate = calculateKeyRate(newInflation, country.keyRate)
  const inflationChange = newInflation - country.inflation
  const keyRateChange = newKeyRate - country.keyRate

  const newInflationHistory = [newInflation, ...(country.inflationHistory || []).slice(0, 9)]

  // Lazy devLog to avoid circular import issues in tests/environments
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { devLog } = require('../../../lib/debug') as { devLog?: (...a: unknown[]) => void }
    if (devLog) {
      devLog('[INFLATION UPDATE] Turn', newTurn, `(Q${newTurn % 4 || 4}), Year`, newYear, {
        oldInflation: country.inflation,
        newInflation,
        change: inflationChange,
        oldHistory: country.inflationHistory,
        newHistory: newInflationHistory,
      })
    }
  } catch {}

  updatedCountries = {
    ...countries,
    [playerCountryId]: {
      ...country,
      inflation: newInflation,
      keyRate: newKeyRate,
      inflationHistory: newInflationHistory,
    },
  }

  inflationNotification = {
    year: newYear,
    inflationRate: newInflation,
    inflationChange,
    keyRate: newKeyRate,
    keyRateChange,
    countryName: country.name,
    timestamp: newTurn,
  }

  notification = {
    id: `inflation_${newTurn}`,
    type: 'info',
    title: `📊 Экономика: Инфляция в ${country.name}`,
    message: formatInflationNotification(inflationNotification),
    date: `${newYear} Q1`,
    isRead: false,
  }

  return { updatedCountries, inflationNotification, notification }
}
