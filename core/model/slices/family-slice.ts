import type { StateCreator } from 'zustand'
import type { GameStore, FamilySlice } from './types'
import type { FamilyMember } from '@/core/types'
import type { PlayerState } from '@/core/types/game.types'
import { FAMILY_PRICES } from '@/core/lib/calculations/family-prices'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import { applyStats } from '@/core/helpers/apply-stats'

export const createFamilySlice: StateCreator<GameStore, [], [], FamilySlice> = (set, get) => ({
  // ------------------------------------------------------------
  // ADD FAMILY MEMBER
  // ------------------------------------------------------------
  addFamilyMember: (name, type, age, income, expenses) => {
    const newMember: FamilyMember = {
      id: `family_${Date.now()}`,
      name,
      type,
      age,
      relationLevel: 50,
      income,
      expenses,
      passiveEffects: {
        happiness: type === 'pet' ? 2 : 5,
        sanity: type === 'pet' ? 3 : 1,
        health: 0,
      },
      foodPreference: type === 'pet' ? undefined : 'food_homemade', // Дефолт для людей
    }

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        familyMembers: [...prev.personal.familyMembers, newMember],
      },
    }))

    get().pushNotification({
      type: 'success',
      title: 'Пополнение в семье!',
      message: `В вашей семье появился новый член: ${name}`,
    })
  },

  // ------------------------------------------------------------
  // REMOVE FAMILY MEMBER
  // ------------------------------------------------------------
  removeFamilyMember: (id) => {
    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        familyMembers: prev.personal.familyMembers.filter((m) => m.id !== id),
      },
    }))
  },

  // ------------------------------------------------------------
  // UPDATE LIFE GOAL
  // ------------------------------------------------------------
  updateLifeGoal: (goalId, progress) => {
    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        lifeGoals: prev.personal.lifeGoals.map((g) => (g.id === goalId ? { ...g, progress } : g)),
      },
    }))
  },

  // ------------------------------------------------------------
  // COMPLETE LIFE GOAL
  // ------------------------------------------------------------
  completeLifeGoal: (goalId) => {
    const { player } = get()
    if (!player) return

    const goal = player.personal.lifeGoals.find((g) => g.id === goalId)
    if (!goal || goal.isCompleted) return

    get().updatePlayer((prev) => {
      const updatedStats = applyStats(prev.personal.stats, { happiness: 10, sanity: 10 })
      return {
        personal: {
          ...prev.personal,
          lifeGoals: prev.personal.lifeGoals.map((g) =>
            g.id === goalId ? { ...g, isCompleted: true, progress: g.target } : g,
          ),
          stats: {
            ...updatedStats,
            happiness: Math.min(100, updatedStats.happiness),
            sanity: Math.min(100, updatedStats.sanity),
          },
        },
      }
    })

    get().pushNotification({
      type: 'success',
      title: 'Цель достигнута! 🎉',
      message: `Вы достигли цели «${goal.title}»`,
    })
  },

  // ------------------------------------------------------------
  // START DATING
  // ------------------------------------------------------------
  startDating: () => {
    const { player, countries } = get()
    if (!player) return

    const energy = player.personal.stats.energy
    const money = player.stats.money

    // Применить инфляцию к цене
    const economy = countries[player.countryId]
    const datingCost = economy
      ? getInflatedPrice(FAMILY_PRICES.DATING_SEARCH, economy, 'services')
      : FAMILY_PRICES.DATING_SEARCH

    if (energy < FAMILY_PRICES.DATING_ENERGY_COST || money < datingCost) return

    get().updatePlayer((prev) => ({
      stats: {
        ...prev.stats,
        money: prev.stats.money - datingCost,
      },
      personal: {
        ...prev.personal,
        isDating: true,
        stats: {
          ...prev.personal.stats,
          energy: prev.personal.stats.energy - FAMILY_PRICES.DATING_ENERGY_COST,
        },
      },
    }))

    get().pushNotification({
      type: 'info',
      title: 'Поиск партнера',
      message: 'Вы начали искать партнера.',
    })
  },

  // ------------------------------------------------------------
  // ACCEPT PARTNER
  // ------------------------------------------------------------
  acceptPartner: () => {
    const { player, countries } = get()
    if (!player || !player.personal.potentialPartner) return

    const partner = player.personal.potentialPartner

    // Применить инфляцию к расходам партнёра
    const economy = countries[player.countryId]
    const partnerExpenses = economy
      ? getInflatedPrice(FAMILY_PRICES.PARTNER_QUARTERLY_EXPENSES, economy, 'services')
      : FAMILY_PRICES.PARTNER_QUARTERLY_EXPENSES

    const jobs = [
      { id: 'job_worker_start', title: 'Рабочий', income: 3000 },
      { id: 'job_indebted_start', title: 'Офисный работник', income: 18000 },
      { id: 'job_marketing', title: 'Digital Marketing Specialist', income: 22500 },
    ]
    const partnerJob = jobs.find((j) => j.title === partner.occupation) || jobs[0]

    const newMember: FamilyMember = {
      id: partner.id,
      name: partner.name,
      type: 'wife',
      age: partner.age,
      relationLevel: 50,
      income: partner.income,
      expenses: 0,
      passiveEffects: {
        happiness: 5,
        sanity: 2,
        health: 0,
      },
      foodPreference: 'food_homemade',
      transportPreference: 'transport_public',
      occupation: partner.occupation,
      jobId: partnerJob.id,
    }

    // Рассчитать расходы партнера
    const { calculateMemberExpenses } = require('@/core/lib/lifestyle-expenses')
    const costModifier = economy?.costOfLivingModifier || 1.0
    newMember.expenses = calculateMemberExpenses(newMember, player.countryId, costModifier)

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        potentialPartner: null,
        isDating: false,
        familyMembers: [...prev.personal.familyMembers, newMember],
      },
    }))

    get().pushNotification({
      type: 'success',
      title: 'Новые отношения!',
      message: `Вы начали отношения с ${partner.name}.`,
    })
  },

  // ------------------------------------------------------------
  // REJECT PARTNER
  // ------------------------------------------------------------
  rejectPartner: () => {
    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        potentialPartner: null,
      },
    }))
  },

  // ------------------------------------------------------------
  // TRY FOR BABY
  // ------------------------------------------------------------
  tryForBaby: () => {
    const { player } = get()
    if (!player) return

    const hasPartner = player.personal.familyMembers.some(
      (m) => m.type === 'wife' || m.type === 'husband',
    )

    if (!hasPartner) return

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        pregnancy: {
          turnsLeft: 3,
          isTwins: Math.random() < 0.1,
          motherId: 'wife',
        },
      },
    }))

    get().pushNotification({
      type: 'success',
      title: 'Планирование ребенка',
      message: 'Вы решили завести ребенка.',
    })
  },

  // ------------------------------------------------------------
  // ADOPT PET
  // ------------------------------------------------------------
  adoptPet: (petType, name, cost) => {
    const { player, countries } = get()
    if (!player) return

    if (player.stats.money < cost) return

    // Применить инфляцию к расходам питомца
    const economy = countries[player.countryId]
    const petExpenses = economy
      ? getInflatedPrice(FAMILY_PRICES.PET_QUARTERLY_EXPENSES, economy, 'services')
      : FAMILY_PRICES.PET_QUARTERLY_EXPENSES

    const newPet: FamilyMember = {
      id: `pet_${Date.now()}`,
      name,
      type: 'pet',
      age: 1,
      relationLevel: 80,
      income: 0,
      expenses: petExpenses,
      passiveEffects: {
        happiness: 3,
        sanity: 2,
        health: 0,
      },
    }

    get().updatePlayer((prev) => ({
      stats: {
        ...prev.stats,
        money: prev.stats.money - cost,
      },
      personal: {
        ...prev.personal,
        familyMembers: [...prev.personal.familyMembers, newPet],
      },
    }))

    get().pushNotification({
      type: 'success',
      title: 'Новый друг!',
      message: `У вас появился питомец: ${name}`,
    })
  },

  // ------------------------------------------------------------
  // SET MEMBER FOOD PREFERENCE
  // ------------------------------------------------------------
  setMemberFoodPreference: (memberId, foodId) => {
    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        familyMembers: prev.personal.familyMembers.map((m) =>
          m.id === memberId ? { ...m, foodPreference: foodId } : m,
        ),
      },
    }))
  },

  // ------------------------------------------------------------
  // SET MEMBER TRANSPORT PREFERENCE
  // ------------------------------------------------------------
  setMemberTransportPreference: (memberId, transportId) => {
    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        familyMembers: prev.personal.familyMembers.map((m) =>
          m.id === memberId ? { ...m, transportPreference: transportId } : m,
        ),
      },
    }))
  },
})
