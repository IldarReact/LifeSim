import type { StateCreator } from 'zustand'
import type { GameStore, NotificationSlice } from './types'

export const createNotificationSlice: StateCreator<
  GameStore,
  [],
  [],
  NotificationSlice
> = (set, get) => ({
  // State
  notifications: [],
  pendingEventNotification: null,

  // Actions
  pushNotification: (notification: Omit<import('@/core/types').Notification, 'id' | 'isRead' | 'date'>) => {
    set(state => ({
      notifications: [
        {
          ...notification,
          id: `notif_${Date.now()}_${Math.random()}`,
          isRead: false,
          date: `${state.year} Q${((state.turn - 1) % 4) + 1}`
        },
        ...state.notifications
      ]
    }))
  },

  dismissNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },

  markNotificationAsRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    }))
  },

  dismissEventNotification: () => {
    set({ pendingEventNotification: null })
  }
})
