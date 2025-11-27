import type { PlayerState, CountryEconomy } from "@/core/types"

export function calculateQuarterlyIncome(
  player: PlayerState,
  country: CountryEconomy
): number {
  // 1. Salary (adjusted by country economy if needed, but usually fixed in contract until changed)
  // Let's say salary grows slightly with GDP
  const salary = player.quarterlySalary * 3

  // 2. Assets income (dividends, rent)
  const assetsIncome = player.assets.reduce((sum, asset) => sum + (asset.income * 3), 0)

  return salary + assetsIncome
}
