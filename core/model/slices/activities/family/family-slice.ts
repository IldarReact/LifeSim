import type { StateCreator } from 'zustand'

import type { GameStore, FamilySlice } from '../../types'


import { processGoalCompletion } from './utils/goal-logic'
import { createNewMember } from './utils/member-factory'
import {
  processStartDating,
  processAcceptPartner,
  processTryForBaby,
  processAdoptPet,
} from './utils/relationship-logic'

import { calculateMemberExpenses } from '@/core/lib/lifestyle-expenses'

export const createFamilySlice: StateCreator<GameStore, [], [], FamilySlice> = (set, get) => ({
  // ------------------------------------------------------------
  // ADD FAMILY MEMBER
  // ------------------------------------------------------------
  addFamilyMember: (name, type, age, income, expenses) => {
    const newMember = createNewMember(name, type, age, income, expenses)

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

    const result = processGoalCompletion(player, goalId)
    if (!result) return

    get().updatePlayer((prev) => ({
      personal: result.personal,
    }))

    get().pushNotification({
      type: 'success',
      title: 'Цель достигнута! 🎉',
      message: `Вы достигли цели «${result.goalTitle}»`,
    })
  },

  // ------------------------------------------------------------
  // START DATING
  // ------------------------------------------------------------
  startDating: () => {
    const { player, countries } = get()
    if (!player) return

    const result = processStartDating(player, countries)
    if (!result) return

    get().updatePlayer((prev) => ({
      stats: {
        ...prev.stats,
        money: prev.stats.money - result.money,
      },
      personal: {
        ...prev.personal,
        isDating: true,
        stats: {
          ...prev.personal.stats,
          energy: prev.personal.stats.energy - result.energy,
          money: prev.personal.stats.money - result.money,
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
    if (!player) return

    const result = processAcceptPartner(player, countries, calculateMemberExpenses)
    if (!result) return

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        potentialPartner: null,
        isDating: false,
        familyMembers: [...prev.personal.familyMembers, result.newMember],
      },
    }))

    get().pushNotification({
      type: 'success',
      title: 'Новые отношения!',
      message: `Вы начали отношения с ${result.partnerName}.`,
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

    const result = processTryForBaby(player)
    if (!result) return

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        pregnancy: result.pregnancy,
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

    const result = processAdoptPet(player, countries, cost, name)
    if (!result) return

    get().updatePlayer((prev) => ({
      stats: {
        ...prev.stats,
        money: prev.stats.money - result.cost,
      },
      personal: {
        ...prev.personal,
        familyMembers: [...prev.personal.familyMembers, result.newPet],
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
