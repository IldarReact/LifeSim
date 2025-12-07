import { describe, it, expect } from 'vitest'
import { calculateQuarterlyIncome } from './calculateQuarterlyIncome'
import { calculateQuarterlyExpenses } from './calculateQuarterlyExpenses'
import { calculateQuarterlyTaxes } from './calculateQuarterlyTaxes'
import { createEmptyQuarterlyReport } from './financial-helpers'
import type { PlayerState } from '@/core/types/game.types'
import type { CountryEconomy } from '@/core/types/economy.types'
import type { Stats } from '@/core/types/stats.types'

describe('Quarterly Calculations', () => {
  const baseStats: Stats = {
    money: 10000,
    happiness: 100,
    energy: 100,
    health: 100,
    sanity: 80,
    intelligence: 100,
  }

  const mockPlayer: PlayerState = {
    id: 'test',
    name: 'Test Player',
    countryId: 'us',
    age: 25,
    creditScore: { value: 650 },
    traits: [],

    // ✅ новая статистика
    stats: { ...baseStats },

    multipliers: {
      happiness: 1,
    },
    happinessMultiplier: 1,

    quarterlySalary: 15000, // 5000 * 3

    assets: [],
    debts: [],

    personal: {
      stats: {
        money: baseStats.money,
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
      familyMembers: [],
      lifeGoals: [],
      isDating: false,
      potentialPartner: null,
      pregnancy: null,
    },

    quarterlyReport: createEmptyQuarterlyReport(),

    jobs: [],
    activeFreelanceGigs: [],
    businesses: [],
    businessIdeas: [],
    activeLifestyle: {},
    housingId: 'housing_room',
  }

  const mockCountry: CountryEconomy = {
    id: 'us',
    name: 'USA',
    gdpGrowth: 2.5,
    inflation: 2.0,
    stockMarketInflation: 4.0,
    keyRate: 5.0,
    interestRate: 5.0,

    taxRate: 20, // налог с зарплаты
    corporateTaxRate: 20, // ✅ НОВОЕ — налог с прибыли бизнеса

    unemployment: 4.0,
    costOfLivingModifier: 1.0,
    salaryModifier: 1.0,

    archetype: 'rich_stable',
    activeEvents: [],
  }

  describe('calculateQuarterlyIncome', () => {
    it('should calculate gross income correctly', () => {
      const result = calculateQuarterlyIncome(mockPlayer, mockCountry)
      expect(result).toBe(15000)
    })
  })

  describe('calculateQuarterlyTaxes', () => {
    it('should calculate tax correctly', () => {
      const income = 15000

      const result = calculateQuarterlyTaxes({
        income,
        assets: mockPlayer.assets,
        country: mockCountry,
        playerAge: mockPlayer.age,
      })

      // 15000 * 0.20 = 3000
      expect(result).toBe(3000)
    })
  })

  describe('calculateQuarterlyExpenses', () => {
    it('should calculate base living expenses', () => {
      const result = calculateQuarterlyExpenses({
        personal: mockPlayer.personal,
        assets: mockPlayer.assets,
        country: mockCountry,
      })

      // Base 1000 * 3 * 1.0 = 3000
      expect(result).toBe(3000)
    })
  })
})
