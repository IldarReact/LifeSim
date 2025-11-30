import type { StateCreator } from 'zustand'
import type { GameStore } from './types'
import type { FreelanceGig, FreelanceApplication, SkillLevel } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'
import type { SkillRequirement } from '@/core/types/skill.types'

export interface FreelanceSlice {
  pendingFreelanceApplications: FreelanceApplication[]

  // Actions
  applyForFreelance: (
    gigId: string,
    title: string,
    payment: number,
    cost: StatEffect,
    requirements: SkillRequirement[]
  ) => void
  acceptFreelanceGig: (applicationId: string) => void
  completeFreelanceGig: (gigId: string) => void
}

export const createFreelanceSlice: StateCreator<
  GameStore,
  [],
  [],
  FreelanceSlice
> = (set, get) => ({
  // State
  pendingFreelanceApplications: [],

  // Actions
  applyForFreelance: (gigId, title, payment, cost, requirements) => {
    const state = get()
    if (!state.player) return

    if (cost.energy && state.player.stats.energy < Math.abs(cost.energy)) {
      set(state => ({
        notifications: [{
          id: `err_${Date.now()}`,
          type: 'info',
          title: 'Недостаточно энергии',
          message: 'У вас недостаточно энергии для выполнения этого заказа.',
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }))
      return
    }

    const newApplication: FreelanceApplication = {
      id: `freelance_app_${Date.now()}`,
      gigId,
      title,
      payment,
      cost,
      requirements
    }

    set(state => ({
      player: state.player ? {
        ...state.player,
        stats: {
          ...state.player.stats,
          energy: state.player.stats.energy + (cost.energy || 0)
        },
        personal: {
          ...state.player.personal,
          stats: {
            ...state.player.personal.stats,
            energy: state.player.personal.stats.energy + (cost.energy || 0)
          }
        }
      } : null,
      pendingFreelanceApplications: [...state.pendingFreelanceApplications, newApplication],
      notifications: [{
        id: `notif_${Date.now()}`,
        type: 'info',
        title: 'Заявка на заказ отправлена',
        message: `Вы подали заявку на заказ "${title}". Ожидайте ответа в следующем квартале.`,
        date: `${state.year} Q${(state.turn % 4) || 4}`,
        isRead: false
      }, ...state.notifications]
    }))
  },

  acceptFreelanceGig: (applicationId: string) => {
    const state = get()
    const notification = state.notifications.find(n => n.data?.freelanceApplicationId === applicationId)

    if (!notification || !state.player) return

    const appData = notification.data

    const newGig: FreelanceGig = {
      id: `gig_${Date.now()}`,
      title: appData.title,
      category: appData.category || 'Фриланс',
      description: appData.description || '',
      payment: appData.payment,
      cost: appData.cost,
      requirements: appData.requirements,
      imageUrl: appData.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
    }

    set(state => ({
      player: state.player ? {
        ...state.player,
        activeFreelanceGigs: [...state.player.activeFreelanceGigs, newGig]
      } : null,
      notifications: state.notifications.filter(n => n.id !== notification.id)
    }))
  },

  completeFreelanceGig: (gigId: string) => {
    set(state => {
      if (!state.player) return {}
      const gig = state.player.activeFreelanceGigs.find(g => g.id === gigId)
      if (!gig) return {}

      return {
        player: {
          ...state.player,
          activeFreelanceGigs: state.player.activeFreelanceGigs.filter(g => g.id !== gigId),
          stats: {
            ...state.player.stats,
            money: state.player.stats.money + gig.payment
          }
        },
        notifications: [{
          id: `gig_complete_${Date.now()}`,
          type: 'success',
          title: 'Заказ выполнен',
          message: `Вы завершили заказ "${gig.title}" и получили $${gig.payment}!`,
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }
    })
  }
})
