import type { PersonalLife } from '@/core/types/personal.types'
import type { Asset } from '@/core/types/finance.types'
import type { CountryEconomy, GlobalEvent } from '@/core/types/economy.types'

interface Params {
  current: PersonalLife
  countryEconomy: CountryEconomy
  cash: number
  assets: Asset[]
  globalEvents: GlobalEvent[]
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

export function calculatePersonalLife({
  current,
  countryEconomy,
  cash,
}: Params): PersonalLife {

  let { happiness, health, sanity, intelligence } = current.stats

  // ====================
  // Базовый ресет энергии
  // ====================
  const energy = 100

  // ====================
  // Влияние финансов
  // ====================
  if (cash < 0) {
    happiness -= 10
    health -= 2
    sanity -= 3
  }

  if (cash > 100_000) {
    happiness += 2
  }

  // ====================
  // Экономика страны
  // ====================
  if (countryEconomy.unemployment > 10) {
    happiness -= 2
    sanity -= 1
  }

  if (countryEconomy.inflation > 10) {
    happiness -= 2
  }

  // ====================
  // Баффы
  // ====================
  for (const buff of current.buffs) {
    if (!buff.effects) continue

    happiness += buff.effects.happiness || 0
    health += buff.effects.health || 0
    sanity += buff.effects.sanity || 0
    intelligence += buff.effects.intelligence || 0
  }

  return {
    ...current,
    stats: {
      money: current.stats.money, // Preserve money value
      happiness: clamp(happiness, 0, 100),
      health: clamp(health, 0, 100),
      energy: clamp(energy, 0, 100),
      sanity: clamp(sanity, 0, 100),
      intelligence: clamp(intelligence, 0, 100),
    }
  }
}
