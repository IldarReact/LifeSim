import type { PersonalLife } from "@/core/types/personal.types"
import type { Asset } from "@/core/types/finance.types"
import type { CountryEconomy } from "@/core/types/economy.types"

interface Params {
  personal: PersonalLife
  assets: Asset[]
  country: CountryEconomy
}

export function calculateQuarterlyExpenses({
  personal,
  assets,
  country,
}: Params): number {
  // Base cost of living adjusted by country
  const baseLivingCost = 1000 * 3 * country.costOfLivingModifier

  // Asset maintenance
  const assetMaintenance = assets.reduce((sum, a) => sum + (a.expenses * 3), 0)

  // Family expenses
  // TODO: Add family size to PersonalLife or PlayerState
  const familyExpenses = 0

  return Math.round(baseLivingCost + assetMaintenance + familyExpenses)
}
