import type { StateCreator } from 'zustand'
import type { GameStore, JobSlice } from './types'
import type { Job, JobApplication } from '@/core/types'

export const createJobSlice: StateCreator<
  GameStore,
  [],
  [],
  JobSlice
> = (set, get) => ({
  // State
  pendingApplications: [],

  // Actions
  applyForJob: (jobTitle: string, company: string, salary: number, energyCost: number, requirements: string[]) => {
    const state = get()
    if (!state.player) return

    if (state.player.personal.energy < energyCost) {
      set(state => ({
        notifications: [{
          id: `err_${Date.now()}`,
          type: 'info',
          title: 'Недостаточно энергии',
          message: 'Вы слишком устали, чтобы проходить собеседование. Отдохните.',
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }))
      return
    }

    const newApplication: JobApplication = {
      id: `app_${Date.now()}`,
      jobTitle,
      company,
      salary,
      energyCost,
      satisfaction: 70,
      requirements,
      daysPending: 0
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
      pendingApplications: [...state.pendingApplications, newApplication],
      notifications: [{
        id: `notif_${Date.now()}`,
        type: 'info',
        title: 'Заявка отправлена',
        message: `Вы подали заявку на вакансию ${jobTitle} в ${company}. Ожидайте ответа в следующем квартале.`,
        date: `${state.year} Q${(state.turn % 4) || 4}`,
        isRead: false
      }, ...state.notifications]
    }))
  },

  acceptJobOffer: (applicationId: string) => {
    const state = get()
    const notification = state.notifications.find(n => n.data?.applicationId === applicationId)

    if (!notification || !state.player) return

    const appData = notification.data

    const newJob: Job = {
      id: `job_${Date.now()}`,
      title: appData.jobTitle,
      company: appData.company,
      salary: appData.salary,
      energyCost: appData.energyCost,
      satisfaction: appData.satisfaction,
      mentalHealthImpact: 0,
      physicalHealthImpact: 0,
      imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
      description: "Новая работа",
      requirements: appData.requirements
    }

    set(state => ({
      player: state.player ? {
        ...state.player,
        jobs: [...state.player.jobs, newJob],
        quarterlySalary: state.player.quarterlySalary + (newJob.salary * 3)
      } : null,
      notifications: state.notifications.filter(n => n.id !== notification.id)
    }))
  },

  quitJob: (jobId: string) => {
    set(state => {
      if (!state.player) return {}
      const job = state.player.jobs.find(j => j.id === jobId)
      if (!job) return {}

      return {
        player: {
          ...state.player,
          jobs: state.player.jobs.filter(j => j.id !== jobId),
          quarterlySalary: state.player.quarterlySalary - (job.salary * 3)
        }
      }
    })
  }
})
