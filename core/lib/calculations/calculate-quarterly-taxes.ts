import type { CountryEconomy } from '@/core/types/economy.types'
import type { Asset, TaxesBreakdown } from '@/core/types/finance.types'
import { sanitizeNumber } from './financial-helpers'

interface Params {
  income: number
  assets: Asset[]
  country: CountryEconomy
}

export function calculateQuarterlyTaxes({ income, assets, country }: Params): TaxesBreakdown {
  // 1. Personal Income Tax (Salary, dividends, family income, etc.)
  const incomeTaxRate = sanitizeNumber(country.taxRate)
  const incomeTax = income * (incomeTaxRate / 100)

  // 2. Property Tax (e.g. 0.5% yearly -> 0.125% quarterly)
  const propertyTax = (assets || [])
    .filter((a) => a.type === 'housing')
    .reduce((sum, a) => sum + sanitizeNumber(a.currentValue || a.value) * 0.00125, 0)

  // 3. Capital Gains Tax (not implemented yet, but keeping for structure)
  const capitalGainsTax = 0

  return {
    income: Math.round(sanitizeNumber(incomeTax)),
    property: Math.round(sanitizeNumber(propertyTax)),
    capital: Math.round(sanitizeNumber(capitalGainsTax)),
    business: 0, // Business tax is usually corporate tax, calculated separately per business
    total: Math.round(
      sanitizeNumber(incomeTax) + sanitizeNumber(propertyTax) + sanitizeNumber(capitalGainsTax),
    ),
  }
}
