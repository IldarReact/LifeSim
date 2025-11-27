import type { StateCreator } from 'zustand'
import type { GameStore } from './types'
import type { FreelanceGig, FreelanceApplication, SkillLevel } from '@/core/types'

export interface FreelanceSlice {
  pendingFreelanceApplications: FreelanceApplication[]
  
  // Actions
  applyForFreelance: (
    gigId: string,
    title: string,
    payment: number,
    energyCost: number,
    requirements: Array<{ skill: string; level: SkillLevel }>
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
  applyForFreelance: (gigId, title, payment, energyCost, requirements) => {
    const state = get()
    if (!state.player) return

    if (state.player.personal.energy < energyCost) {
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
      energyCost,
      requirements
    }
    
    set(state => ({
      player: state.player ? {
        ...state.player,
        personal: {
          ...state.player.personal,
          energy: state.player.personal.energy - energyCost
        },
        energy: state.player.energy - energyCost
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
      energyCost: appData.energyCost,
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
          cash: state.player.cash + gig.payment
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
