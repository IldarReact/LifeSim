import type { CountryEconomy, CountryArchetype } from '@/core/types/economy.types'

// Статический импорт всех economy.json файлов
import usEconomy from '@/shared/data/world/countries/us/economy.json'
import germanyEconomy from '@/shared/data/world/countries/germany/economy.json'
import brazilEconomy from '@/shared/data/world/countries/brazil/economy.json'

export interface CountryData extends CountryEconomy {
  // Дополнительные поля, если появятся
}

// Создаем объект со всеми странами
const rawCountries = {
  us: usEconomy,
  germany: germanyEconomy,
  brazil: brazilEconomy
} as const

// Преобразуем в нужный формат с валидацией
export const WORLD_COUNTRIES: Readonly<Record<string, CountryData>> = Object.entries(rawCountries).reduce((acc, [key, raw]) => {
  // Валидация минимальных полей
  if (!raw.id || !raw.name) {
    console.warn('Skipping invalid country data:', raw)
    return acc
  }

  const country: CountryData = {
    id: raw.id,
    name: raw.name,
    archetype: (raw.archetype ?? 'rich_stable') as CountryArchetype,
    gdpGrowth: raw.gdpGrowth ?? 0,
    inflation: raw.inflation ?? 0,
    stockMarketInflation: raw.stockMarketInflation ?? raw.inflation ?? 0,
    keyRate: raw.keyRate ?? 0,
    interestRate: raw.keyRate ?? 0, // Fallback for deprecated field
    unemployment: raw.unemployment ?? 0,
    taxRate: raw.taxRate ?? 0,
    corporateTaxRate: raw.corporateTaxRate ?? 0,
    salaryModifier: raw.salaryModifier ?? 1,
    costOfLivingModifier: raw.costOfLivingModifier ?? 1,
    baseSalaries: (raw as any).baseSalaries,
    activeEvents: [],
    inflationHistory: raw.inflation ? [raw.inflation] : [],
    baseYear: 2024,
    imageUrl: raw.imageUrl
  }

  acc[country.id] = country
  return acc
}, {} as Record<string, CountryData>)

export const getCountry = (id: string) => WORLD_COUNTRIES[id]
export const getAllCountryIds = () => Object.keys(WORLD_COUNTRIES)

export const getAvailableCountries = () =>
  Object.values(WORLD_COUNTRIES)
    .map((data) => ({ id: data.id, name: data.name }))