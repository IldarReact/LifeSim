import type { PersonalLife } from "@/core/types/personal.types"

export function applyRandomPersonalEvents(personal: PersonalLife, turn: number): PersonalLife {
  // Simple random event logic
  if (Math.random() > 0.9) {
    // Sick
    return {
      ...personal,
      stats: {
        ...personal.stats,
        health: Math.max(0, personal.stats.health - 10),
        happiness: Math.max(0, personal.stats.happiness - 5)
      }
    }
  }

  return personal
}
