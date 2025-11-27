import type { Asset, Debt, CountryEconomy, GlobalEvent } from "@/core/types"

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
      // Stocks are volatile
      const volatility = 0.1 // 10%
      const marketMove = (Math.random() - 0.5) * 2 * volatility
      valueChange = asset.value * (marketMove + (countryEconomy.gdpGrowth / 100))
    } else if (asset.type === 'real_estate') {
      // Real estate follows inflation + small growth
      const growth = (countryEconomy.inflation / 100) + 0.01 
      valueChange = asset.value * growth
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
