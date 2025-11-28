import type { PersonalLife } from "@/core/types/personal.types"
import type { Asset } from "@/core/types/finance.types"
import type { CountryEconomy, GlobalEvent } from "@/core/types/economy.types"

interface Params {
  current: PersonalLife
  countryEconomy: CountryEconomy
  cash: number
  assets: Asset[]
  globalEvents: GlobalEvent[]
}

export function calculatePersonalLife({
  current,
  countryEconomy,
  cash,
  assets,
  globalEvents,
}: Params): PersonalLife {
  let newHappiness = current.happiness
  let newHealth = current.health

  // Base recovery to 100 at start of new quarter
  // Real energy for the turn will be calculated in game-store by subtracting job costs
  let newEnergy = 100

  // Money impact
  if (cash < 0) {
    newHappiness -= 10
    newHealth -= 2 // Stress
  } else if (cash > 100000) {
    newHappiness += 2
  }

  // Economy impact
  if (countryEconomy.unemployment > 10) {
    newHappiness -= 2 // Anxiety
  }

  return {
    ...current,
    happiness: Math.max(0, Math.min(100, newHappiness)),
    health: Math.max(0, Math.min(100, newHealth)),
    energy: newEnergy,
    relations: current.relations,
    skills: current.skills,
  }
}
