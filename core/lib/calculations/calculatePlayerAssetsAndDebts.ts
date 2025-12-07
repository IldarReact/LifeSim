import type { Asset, Debt } from "@/core/types/finance.types"
import type { CountryEconomy, GlobalEvent } from "@/core/types/economy.types"

interface CalculationResult {
  newAssets: Asset[]
  newDebts: Debt[]
  cashDelta: number // Changes in cash (e.g. debt payments are negative here if automated, but usually expenses handled separately)
}

interface Params {
  assets: Asset[]
  debts: Debt[]
  countryEconomy: CountryEconomy
  globalEvents: GlobalEvent[]
}

export function calculatePlayerAssetsAndDebts({
  assets,
  debts,
  countryEconomy,
  globalEvents,
}: Params): CalculationResult {

  // 1. Assets value update
  const newAssets = assets.map(asset => {
    let valueChange = 0

    if (asset.type === 'stock') {
      // Stocks use country-specific stock market inflation + volatility
      const volatility = 0.1 // 10% volatility
      const marketMove = (Math.random() - 0.5) * 2 * volatility
      // Quarterly growth based on annual stockMarketInflation
      const quarterlyStockGrowth = countryEconomy.stockMarketInflation / 4 / 100
      valueChange = asset.value * (marketMove + quarterlyStockGrowth)
    } else if (asset.type === 'housing') {
      // Real estate follows inflation + small growth
      // Quarterly growth based on annual inflation
      const quarterlyGrowth = countryEconomy.inflation / 4 / 100 + 0.0025 // +0.25% per quarter base growth
      valueChange = asset.value * quarterlyGrowth
    }

    return {
      ...asset,
      value: Math.round(asset.value + valueChange)
    }
  })

  // 2. Debts update (interest accumulation if not paid, but usually we pay monthly)
  // Here we assume debts are just static unless paid off, or maybe variable rate changes
  const newDebts = debts.map(debt => {
    // If variable rate, update based on country interest rate
    // For now, keep simple
    return debt
  })

  return {
    newAssets,
    newDebts,
    cashDelta: 0 // No cash change here, income/expenses handled elsewhere
  }
}
