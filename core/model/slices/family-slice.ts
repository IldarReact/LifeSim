import type { StateCreator } from 'zustand'
import type { GameStore, FamilySlice } from './types'
import type { FamilyMember } from '@/core/types'

export const createFamilySlice: StateCreator<
  GameStore,
  [],
  [],
  FamilySlice
> = (set, get) => ({
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
        happinessMod: type === 'pet' ? 2 : 5,
        sanityMod: type === 'pet' ? 3 : 1,
        healthMod: 0
      }

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            familyMembers: [...state.player.personal.familyMembers, newMember]
          }
        },
        notifications: [{
          id: `family_add_${Date.now()}`,
          type: 'success',
          title: 'Пополнение в семье!',
          message: `В вашей семье появился новый член: ${name} (${type === 'pet' ? 'Питомец' : type === 'wife' ? 'Жена' : type === 'husband' ? 'Муж' : 'Ребенок'})!`,
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  },

  removeFamilyMember: (id) => {
    set(state => {
      if (!state.player) return {}
      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            familyMembers: state.player.personal.familyMembers.filter(m => m.id !== id)
          }
        }
      }
    })
  },

  updateLifeGoal: (goalId, progress) => {
    set(state => {
      if (!state.player) return {}
      
      const goals = state.player.personal.lifeGoals.map(g => {
        if (g.id === goalId) {
          return { ...g, progress }
        }
        return g
      })

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            lifeGoals: goals
          }
        }
      }
    })
  },

  completeLifeGoal: (goalId) => {
    set(state => {
      if (!state.player) return {}
      
      const goal = state.player.personal.lifeGoals.find(g => g.id === goalId)
      if (!goal || goal.isCompleted) return {}

      const updatedGoals = state.player.personal.lifeGoals.map(g => 
        g.id === goalId ? { ...g, isCompleted: true, progress: g.target } : g
      )

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            lifeGoals: updatedGoals,
            // Apply immediate reward if needed, but mostly it's passive per turn
            happiness: Math.min(100, state.player.personal.happiness + 10),
            sanity: Math.min(100, state.player.personal.sanity + 10)
          }
        },
        notifications: [{
          id: `goal_complete_${Date.now()}`,
          type: 'success',
          title: 'Цель достигнута! 🎉',
          message: `Вы достигли цели "${goal.title}"! Теперь вы будете получать бонусы к счастью и рассудку.`,
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  },

  startDating: () => {
    set(state => {
      if (!state.player) return {}
      
      // Cost: 30 Energy, $200
      if (state.player.personal.energy < 30 || state.player.cash < 200) {
        return {} // Should handle UI feedback elsewhere or return success boolean
      }

      return {
        player: {
          ...state.player,
          cash: state.player.cash - 200,
          personal: {
            ...state.player.personal,
            energy: state.player.personal.energy - 30,
            isDating: true
          }
        },
        notifications: [{
          id: `dating_start_${Date.now()}`,
          type: 'info',
          title: 'Поиск партнера',
          message: 'Вы начали активный поиск партнера. Результаты будут в следующем квартале.',
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  },

  acceptPartner: () => {
    set(state => {
      if (!state.player || !state.player.personal.potentialPartner) return {}
      
      const partner = state.player.personal.potentialPartner
      const newMember: FamilyMember = {
        id: partner.id,
        name: partner.name,
        type: 'wife',
        age: partner.age,
        relationLevel: 50,
        income: partner.income,
        expenses: 1500,
        happinessMod: 5,
        sanityMod: 2,
        healthMod: 0
      }

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            potentialPartner: null,
            isDating: false,
            familyMembers: [...state.player.personal.familyMembers, newMember]
          }
        },
        notifications: [{
          id: `partner_accept_${Date.now()}`,
          type: 'success',
          title: 'Новые отношения!',
          message: `Вы начали встречаться с ${partner.name}.`,
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  },

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

  tryForBaby: () => {
    set(state => {
      if (!state.player) return {}
      
      // Check if has partner
      const hasPartner = state.player.personal.familyMembers.some(m => m.type === 'wife' || m.type === 'husband')
      if (!hasPartner) return {}

      // 9 months = 3 turns
      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            pregnancy: {
              turnsLeft: 3,
              isTwins: Math.random() < 0.1, // 10% chance of twins
              motherId: 'wife' // Simplified
            }
          }
        },
        notifications: [{
          id: `pregnancy_start_${Date.now()}`,
          type: 'success',
          title: 'Планирование ребенка',
          message: 'Вы решили завести ребенка. Ожидайте новостей!',
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  },

  adoptPet: (petType, name, cost) => {
    set(state => {
      if (!state.player || state.player.cash < cost) return {}

      const newMember: FamilyMember = {
        id: `pet_${Date.now()}`,
        name,
        type: 'pet',
        age: 1,
        relationLevel: 80,
        income: 0,
        expenses: 100,
        happinessMod: 3,
        sanityMod: 2,
        healthMod: 0
      }

      return {
        player: {
          ...state.player,
          cash: state.player.cash - cost,
          personal: {
            ...state.player.personal,
            familyMembers: [...state.player.personal.familyMembers, newMember]
          }
        },
        notifications: [{
          id: `pet_adopt_${Date.now()}`,
          type: 'success',
          title: 'Новый друг!',
          message: `У вас появился питомец: ${name}!`,
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  }
})
