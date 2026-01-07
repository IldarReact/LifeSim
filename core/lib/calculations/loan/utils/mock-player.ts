import { createEmptyQuarterlyReport } from '@/core/lib/calculations/financial-helpers'
import type { Player } from '@/core/types'
import type { Stats } from '@/core/types/stats.types'

export const createMockPlayer = (
  overrides?: Partial<Player>
): Player => {
  const baseStats: Stats = {
    money: 50000,
    happiness: 100,
    energy: 100,
    health: 100,
    sanity: 100,
    intelligence: 100,
  }

  return {
    id: 'test',
    name: 'Test Player',
    countryId: 'us',
    age: 25,
    creditScore: { value: 650 },
    traits: [],

    // ✅ Новая система статов
    stats: { ...baseStats },

    multipliers: {
      happiness: 1,
    },
    happinessMultiplier: 1,

    assets: [],
    debts: [],

    personal: {
      stats: {
        money: 0, // Personal stats don't track money separately
        happiness: baseStats.happiness,
        energy: baseStats.energy,
        health: baseStats.health,
        sanity: baseStats.sanity,
        intelligence: baseStats.intelligence,
      },

      relations: { family: 50, friends: 50, colleagues: 50 },
      skills: [],
      activeCourses: [],
      activeUniversity: [],
      buffs: [],
      lifeGoals: [],
      familyMembers: [],

      isDating: false,
      potentialPartner: null,
      pregnancy: null,
    },

    quarterlyReport: createEmptyQuarterlyReport(),
    quarterlySalary: 150000,

    jobs: [],
    activeFreelanceGigs: [],
    businesses: [],
    businessIdeas: [],
    activeLifestyle: {},
    housingId: 'housing_room',

    ...overrides,
  }
}
