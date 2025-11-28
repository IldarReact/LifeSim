import { describe, it, expect } from 'vitest'
import { calculateQuarterlyIncome } from './calculateQuarterlyIncome'
import { calculateQuarterlyExpenses } from './calculateQuarterlyExpenses'
import { calculateQuarterlyTaxes } from './calculateQuarterlyTaxes'
import type { PlayerState } from '@/core/types/game.types'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Game Calculations', () => {
  const mockPlayer: PlayerState = {
    id: 'test',
    name: 'Test Player',
    archetype: 'entrepreneur',
    countryId: 'us',
    cash: 10000,
    quarterlySalary: 15000, // 5000 * 3
    assets: [],
    debts: [],
    personal: {
      happiness: 100,
      health: 100,
      energy: 100,
      intelligence: 100,
      sanity: 80,
      relations: { family: 50, friends: 50, colleagues: 50 },
      skills: [],
      activeCourses: [],
      activeUniversity: [],
      buffs: [],
      familyMembers: [],
      lifeGoals: [],
      isDating: false,
      potentialPartner: null,
      pregnancy: null
    },
    happinessMultiplier: 1,
    quarterlyReport: {
      income: 0,
      taxes: 0,
      expenses: 0,
      profit: 0,
      warning: null
    },
    age: 25,
    health: 100,
    energy: 100,
    jobs: [],
    activeFreelanceGigs: [],
    businesses: []
  }

  const mockCountry: CountryEconomy = {
    id: 'us',
    name: 'USA',
    gdpGrowth: 2.5,
    inflation: 2.0,
    keyRate: 5.0,
    interestRate: 5.0,
    taxRate: 20,
    unemployment: 4.0,
    costOfLivingModifier: 1.0,
    salaryModifier: 1.0,
    archetype: 'rich_stable',
    activeEvents: []
  }

  describe('calculateQuarterlyIncome', () => {
    it('should calculate gross income correctly', () => {
      const result = calculateQuarterlyIncome(mockPlayer, mockCountry)
      // 15000 (quarterly salary)
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
        playerAge: mockPlayer.age
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
        country: mockCountry
      })
      // Base 1000 * 3 * 1.0 = 3000
      expect(result).toBe(3000)
    })
  })
})
