import type { Asset } from "@/core/types/finance.types"
import type { CountryEconomy } from "@/core/types/economy.types"

interface Params {
  income: number
  assets: Asset[]
  country: CountryEconomy
  playerAge: number
}

export function calculateQuarterlyTaxes({
  income,
  assets,
  country,
  playerAge,
}: Params): number {
  // Simple flat tax for now
  const incomeTax = income * (country.taxRate / 100)

  // Property tax (e.g. 0.5% yearly -> 0.125% quarterly)
  const propertyTax = assets
    .filter(a => a.type === 'housing')
    .reduce((sum, a) => sum + (a.value * 0.00125), 0)

  return Math.round(incomeTax + propertyTax)
}
