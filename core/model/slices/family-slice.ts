import type { StateCreator } from 'zustand'
import type { GameStore, FamilySlice } from './types'
import type { FamilyMember } from '@/core/types'

export const createFamilySlice: StateCreator<
  GameStore,
  [],
  [],
  FamilySlice
> = (set, get) => ({

  // ------------------------------------------------------------------
  // ADD FAMILY MEMBER
  // ------------------------------------------------------------------
  addFamilyMember: (name, type, age, income, expenses) => {
    set(state => {
      if (!state.player) return {}

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

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            familyMembers: [
              ...state.player.personal.familyMembers,
              newMember
            ]
          }
        },
        notifications: [{
          id: `family_add_${Date.now()}`,
          type: 'success',
          title: 'Пополнение в семье!',
          message: `В вашей семье появился новый член: ${name}`,
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  },

  // ------------------------------------------------------------------
  // REMOVE FAMILY MEMBER
  // ------------------------------------------------------------------
  removeFamilyMember: (id) => {
    set(state => {
      if (!state.player) return {}

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            familyMembers:
              state.player.personal.familyMembers.filter(
                m => m.id !== id
              )
          }
        }
      }
    })
  },

  // ------------------------------------------------------------------
  // UPDATE LIFE GOAL
  // ------------------------------------------------------------------
  updateLifeGoal: (goalId, progress) => {
    set(state => {
      if (!state.player) return {}

      const updatedGoals = state.player.personal.lifeGoals.map(goal =>
        goal.id === goalId
          ? { ...goal, progress }
          : goal
      )

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            lifeGoals: updatedGoals
          }
        }
      }
    })
  },

  // ------------------------------------------------------------------
  // COMPLETE LIFE GOAL
  // ------------------------------------------------------------------
  completeLifeGoal: (goalId) => {
    set(state => {
      if (!state.player) return {}

      const goal = state.player.personal.lifeGoals.find(
        g => g.id === goalId
      )

      if (!goal || goal.isCompleted) return {}

      const updatedGoals = state.player.personal.lifeGoals.map(g =>
        g.id === goalId
          ? { ...g, isCompleted: true, progress: g.target }
          : g
      )

      const stats = state.player.personal.stats

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            lifeGoals: updatedGoals,
            stats: {
              ...stats,
              happiness: Math.min(100, stats.happiness + 10),
              sanity: Math.min(100, stats.sanity + 10)
            }
          }
        },
        notifications: [{
          id: `goal_complete_${Date.now()}`,
          type: 'success',
          title: 'Цель достигнута! 🎉',
          message: `Вы достигли цели «${goal.title}»`,
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  },

  // ------------------------------------------------------------------
  // START DATING
  // ------------------------------------------------------------------
  startDating: () => {
    set(state => {
      if (!state.player) return {}

      const energy = state.player.personal.stats.energy
      const money = state.player.stats.money

      if (energy < 30 || money < 200) return {}

      return {
        player: {
          ...state.player,
          stats: {
            ...state.player.stats,
            money: money - 200
          },
          personal: {
            ...state.player.personal,
            isDating: true,
            stats: {
              ...state.player.personal.stats,
              energy: energy - 30
            }
          }
        },
        notifications: [{
          id: `dating_start_${Date.now()}`,
          type: 'info',
          title: 'Поиск партнера',
          message: 'Вы начали искать партнера.',
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  },

  // ------------------------------------------------------------------
  // ACCEPT PARTNER
  // ------------------------------------------------------------------
  acceptPartner: () => {
    set(state => {
      if (!state.player) return {}
      if (!state.player.personal.potentialPartner) return {}

      const partner = state.player.personal.potentialPartner

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

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            potentialPartner: null,
            isDating: false,
            familyMembers: [
              ...state.player.personal.familyMembers,
              newMember
            ]
          }
        },
        notifications: [{
          id: `partner_accept_${Date.now()}`,
          type: 'success',
          title: 'Новые отношения!',
          message: `Вы начали отношения с ${partner.name}.`,
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  },

  // ------------------------------------------------------------------
  // REJECT PARTNER
  // ------------------------------------------------------------------
  rejectPartner: () => {
    set(state => {
      if (!state.player) return {}

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            potentialPartner: null
          }
        }
      }
    })
  },

  // ------------------------------------------------------------------
  // TRY FOR BABY
  // ------------------------------------------------------------------
  tryForBaby: () => {
    set(state => {
      if (!state.player) return {}

      const hasPartner =
        state.player.personal.familyMembers.some(m =>
          m.type === 'wife' || m.type === 'husband'
        )

      if (!hasPartner) return {}

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            pregnancy: {
              turnsLeft: 3,
              isTwins: Math.random() < 0.1,
              motherId: 'wife'
            }
          }
        },
        notifications: [{
          id: `pregnancy_start_${Date.now()}`,
          type: 'success',
          title: 'Планирование ребенка',
          message: 'Вы решили завести ребенка.',
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  },

  // ------------------------------------------------------------------
  // ADOPT PET
  // ------------------------------------------------------------------
  adoptPet: (petType, name, cost) => {
    set(state => {
      if (!state.player) return {}

      const money = state.player.stats.money
      if (money < cost) return {}

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

      return {
        player: {
          ...state.player,
          stats: {
            ...state.player.stats,
            money: money - cost
          },
          personal: {
            ...state.player.personal,
            familyMembers: [
              ...state.player.personal.familyMembers,
              newPet
            ]
          }
        },
        notifications: [{
          id: `pet_adopt_${Date.now()}`,
          type: 'success',
          title: 'Новый друг!',
          message: `У вас появился питомец: ${name}`,
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  }

})
