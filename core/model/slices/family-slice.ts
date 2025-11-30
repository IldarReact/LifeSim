import type { StateCreator } from 'zustand'
import type { GameStore, FamilySlice } from './types'
import type { FamilyMember } from '@/core/types'
import type { PlayerState } from '@/core/types/game.types'

export const createFamilySlice: StateCreator<
  GameStore,
  [],
  [],
  FamilySlice
> = (set, get) => ({

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
        health: 0
      }
    }

    get().updatePlayer(prev => ({
      personal: {
        ...prev.personal,
        familyMembers: [...prev.personal.familyMembers, newMember]
      }
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
    get().updatePlayer(prev => ({
      personal: {
        ...prev.personal,
        familyMembers: prev.personal.familyMembers.filter(m => m.id !== id)
      }
    }))
  },

  // ------------------------------------------------------------
  // UPDATE LIFE GOAL
  // ------------------------------------------------------------
  updateLifeGoal: (goalId, progress) => {
    get().updatePlayer(prev => ({
      personal: {
        ...prev.personal,
        lifeGoals: prev.personal.lifeGoals.map(g =>
          g.id === goalId ? { ...g, progress } : g
        )
      }
    }))
  },

  // ------------------------------------------------------------
  // COMPLETE LIFE GOAL
  // ------------------------------------------------------------
  completeLifeGoal: (goalId) => {
    const { player } = get()
    if (!player) return

    const goal = player.personal.lifeGoals.find(g => g.id === goalId)
    if (!goal || goal.isCompleted) return

    get().updatePlayer(prev => ({
      personal: {
        ...prev.personal,
        lifeGoals: prev.personal.lifeGoals.map(g =>
          g.id === goalId
            ? { ...g, isCompleted: true, progress: g.target }
            : g
        ),
        stats: {
          ...prev.personal.stats,
          happiness: Math.min(100, prev.personal.stats.happiness + 10),
          sanity: Math.min(100, prev.personal.stats.sanity + 10)
        }
      }
    }))

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
    const { player } = get()
    if (!player) return

    const energy = player.personal.stats.energy
    const money = player.stats.money

    if (energy < 30 || money < 200) return

    get().updatePlayer(prev => ({
      stats: {
        ...prev.stats,
        money: prev.stats.money - 200
      },
      personal: {
        ...prev.personal,
        isDating: true,
        stats: {
          ...prev.personal.stats,
          energy: prev.personal.stats.energy - 30
        }
      }
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
    const { player } = get()
    if (!player || !player.personal.potentialPartner) return

    const partner = player.personal.potentialPartner

    const newMember: FamilyMember = {
      id: partner.id,
      name: partner.name,
      type: 'wife',
      age: partner.age,
      relationLevel: 50,
      income: partner.income,
      expenses: 1500,
      passiveEffects: {
        happiness: 5,
        sanity: 2,
        health: 0
      }
    }

    get().updatePlayer(prev => ({
      personal: {
        ...prev.personal,
        potentialPartner: null,
        isDating: false,
        familyMembers: [...prev.personal.familyMembers, newMember]
      }
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
    get().updatePlayer(prev => ({
      personal: {
        ...prev.personal,
        potentialPartner: null
      }
    }))
  },

  // ------------------------------------------------------------
  // TRY FOR BABY
  // ------------------------------------------------------------
  tryForBaby: () => {
    const { player } = get()
    if (!player) return

    const hasPartner = player.personal.familyMembers.some(
      m => m.type === 'wife' || m.type === 'husband'
    )

    if (!hasPartner) return

    get().updatePlayer(prev => ({
      personal: {
        ...prev.personal,
        pregnancy: {
          turnsLeft: 3,
          isTwins: Math.random() < 0.1,
          motherId: 'wife'
        }
      }
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
    const { player } = get()
    if (!player) return

    if (player.stats.money < cost) return

    const newPet: FamilyMember = {
      id: `pet_${Date.now()}`,
      name,
      type: 'pet',
      age: 1,
      relationLevel: 80,
      income: 0,
      expenses: 100,
      passiveEffects: {
        happiness: 3,
        sanity: 2,
        health: 0
      }
    }

    get().updatePlayer(prev => ({
      stats: {
        ...prev.stats,
        money: prev.stats.money - cost
      },
      personal: {
        ...prev.personal,
        familyMembers: [...prev.personal.familyMembers, newPet]
      }
    }))

    get().pushNotification({
      type: 'success',
      title: 'Новый друг!',
      message: `У вас появился питомец: ${name}`,
    })
  }

})
