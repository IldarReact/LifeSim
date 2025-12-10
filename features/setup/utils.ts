import { CHARACTER_IMAGES } from './shared-constants'
import type { CharacterDetailedInfo } from './types'

export function getCharacterImage(archetypeId: string): string {
  return CHARACTER_IMAGES[archetypeId] || CHARACTER_IMAGES.default
}

export function calculateQuarterlySalary(monthlySalary: number): number {
  return monthlySalary * 3
}

export const MOCK_DETAILED_INFO: CharacterDetailedInfo = {
  family: {
    spouse: { name: "Елена", age: 28, job: "Дизайнер" },
    children: [
      { name: "Максим", age: 5 },
      { name: "Алиса", age: 2 },
    ],
    pet: { name: "Бобик", type: "Собака" },
  },
  assets: [],
  debts: [],
  savings: [],
  investments: [],
}
