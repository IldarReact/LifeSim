import type { HumanTrait } from "@/core/types/human-traits.types"
import humanTraitsData from "@/shared/data/world/commons/human-traits.json"
import { TrendingUp, AlertCircle, Activity, User } from "lucide-react"

export const TRAITS_MAP = humanTraitsData.reduce((acc, trait) => {
  acc[trait.id] = trait as HumanTrait
  return acc
}, {} as Record<string, HumanTrait>)

export function getTraitColor(type: HumanTrait['type']): string {
  switch (type) {
    case 'positive': return 'text-green-400'
    case 'negative': return 'text-rose-400'
    case 'medical': return 'text-amber-400'
    default: return 'text-white/80'
  }
}

export function getTraitIcon(type: HumanTrait['type']) {
  switch (type) {
    case 'positive': return TrendingUp
    case 'negative': return AlertCircle
    case 'medical': return Activity
    default: return User
  }
}
