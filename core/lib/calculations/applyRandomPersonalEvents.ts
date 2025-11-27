import type { PersonalLife } from "@/core/types"

export function applyRandomPersonalEvents(personal: PersonalLife, turn: number): PersonalLife {
  // Simple random event logic
  if (Math.random() > 0.9) {
    // Sick
    return {
      ...personal,
      health: Math.max(0, personal.health - 10),
      happiness: Math.max(0, personal.happiness - 5)
    }
  }
  
  return personal
}
