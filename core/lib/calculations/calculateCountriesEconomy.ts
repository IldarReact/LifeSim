import type { CountryEconomy, GlobalEvent } from "@/core/types/economy.types"

export function calculateCountriesEconomy(
  countries: Record<string, CountryEconomy>,
  globalEvents: GlobalEvent[]
): Record<string, CountryEconomy> {
  const newCountries: Record<string, CountryEconomy> = {}

  for (const [id, country] of Object.entries(countries)) {
    let inflationDelta = (Math.random() - 0.5) * 0.5 // +/- 0.25% change
    let gdpDelta = (Math.random() - 0.5) * 0.5

    // Global events impact
    if (globalEvents.some(e => e.id === "financial_crisis")) {
      gdpDelta -= 1.0
      inflationDelta += 1.0
    }
    if (globalEvents.some(e => e.id === "tech_boom")) {
      gdpDelta += 1.5
    }

    newCountries[id] = {
      ...country,
      inflation: Math.max(0, country.inflation + inflationDelta),
      gdpGrowth: country.gdpGrowth + gdpDelta,
      // Simple central bank logic: raise rates if inflation is high
      interestRate: country.inflation > 5 ? country.interestRate + 0.25 : country.interestRate,
    }
  }

  return newCountries
}
