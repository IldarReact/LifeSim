import type { CountryEconomy } from '@/core/types/economy.types'
import type { Player } from '@/core/types/game.types'

export function calculateQuarterlyIncome(player: Player, country: CountryEconomy): number {
  // 1. Salary (adjusted by country economy if needed, but usually fixed in contract until changed)
  // Let's say salary grows slightly with GDP
  const salary = player.quarterlySalary

  // 2. Assets income (dividends, rent)
  const assetsIncome = player.assets.reduce((sum, asset) => sum + asset.income * 3, 0)

  // 3. Family members income
  const familyIncome = player.personal.familyMembers.reduce(
    (sum, member) => sum + (member.income || 0),
    0,
  )

  return salary + assetsIncome + familyIncome
}
