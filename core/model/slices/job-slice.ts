import type { StateCreator } from 'zustand'
import type { GameStore, JobSlice } from './types'
import type { Job, JobApplication } from '@/core/types'

import type { StatEffect } from '@/core/types/stats.types'
import type { SkillRequirement } from '@/core/types/skill.types'
import { formatGameDate } from '@/core/lib/quarter'

type JobApplicationNotificationData = {
  applicationId: string
  jobTitle: string
  company: string
  salary: number
  cost?: StatEffect
  requirements: SkillRequirement[]
}

export const createJobSlice: StateCreator<GameStore, [], [], JobSlice> = (set, get) => ({
  // State
  pendingApplications: [],

  // Actions
  applyForJob: (
    jobTitle: string,
    company: string,
    salary: number,
    cost: StatEffect,
    requirements: SkillRequirement[],
  ) => {
    const state = get()
    if (!state.player) return

    // Check energy if present in cost
    if (cost.energy && state.player.stats.energy < Math.abs(cost.energy)) {
      set((state) => ({
        notifications: [
          {
            id: `err_${Date.now()}`,
            type: 'info',
            title: 'Недостаточно энергии',
            message: 'Вы слишком устали, чтобы проходить собеседование. Отдохните.',
            date: formatGameDate(state.year, state.turn),
            isRead: false,
          },
          ...state.notifications,
        ],
      }))
      return
    }

    const newApplication: JobApplication = {
      id: `app_${Date.now()}`,
      jobTitle,
      company,
      salary,
      cost,
      requirements,
      daysPending: 0,
    }

    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            // Apply immediate cost (e.g. energy for interview)
            stats: {
              ...state.player.stats,
              energy: state.player.stats.energy + (cost.energy || 0),
            },
            personal: {
              ...state.player.personal,
              stats: {
                ...state.player.personal.stats,
                energy: state.player.personal.stats.energy + (cost.energy || 0),
              },
            },
          }
        : null,
      pendingApplications: [...state.pendingApplications, newApplication],
      notifications: [
        {
          id: `notif_${Date.now()}`,
          type: 'info',
          title: 'Заявка отправлена',
          message: `Вы подали заявку на вакансию ${jobTitle} в ${company}. Ожидайте ответа в следующем квартале.`,
          date: formatGameDate(state.year, state.turn),
          isRead: false,
        },
        ...state.notifications,
      ],
    }))
  },

  acceptJobOffer: (applicationId: string) => {
    const state = get()
    const notification = state.notifications.find(
      (n) =>
        typeof n.data === 'object' &&
        n.data !== null &&
        'applicationId' in n.data &&
        n.data.applicationId === applicationId,
    )

    if (!notification || !state.player) return

    const appData = notification.data as JobApplicationNotificationData

    const newJob: Job = {
      id: `job_${Date.now()}`,
      title: appData.jobTitle,
      company: appData.company,
      salary: appData.salary,
      cost: appData.cost || {},
      imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop',
      description: 'Новая работа',
      requirements: appData.requirements
        ? {
            skills: appData.requirements.map((r) => ({
              name: r.skillId,
              level: 1,
            })),
          }
        : undefined,
    }

    console.log('acceptJobOffer - newJob.cost:', newJob.cost)

    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            jobs: [...state.player.jobs, newJob],
            quarterlySalary: state.player.quarterlySalary + newJob.salary * 3,
          }
        : null,
      notifications: state.notifications.filter((n) => n.id !== notification.id),
    }))
  },

  quitJob: (jobId: string) => {
    set((state) => {
      if (!state.player) return {}
      const job = state.player.jobs.find((j) => j.id === jobId)
      if (!job) return {}

      return {
        player: {
          ...state.player,
          jobs: state.player.jobs.filter((j) => j.id !== jobId),
          quarterlySalary: state.player.quarterlySalary - job.salary * 3,
        },
      }
    })
  },

  acceptExternalJob: (jobTitle: string, company: string, salary: number, businessId: string) => {
    const state = get()
    if (!state.player) return

    // Зарплата в оффере указана за квартал, а в Job хранится за месяц
    const monthlySalary = Math.round(salary / 3)

    const newJob: import('@/core/types').Job = {
      id: `job_ext_${Date.now()}`,
      title: jobTitle,
      company: company,
      salary: monthlySalary,
      cost: { energy: -20 },
      imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop',
      description: `Работа в ${company} (онлайн)`,
      requirements: {},
    }

    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            jobs: [...state.player.jobs, newJob],
            quarterlySalary: state.player.quarterlySalary + salary,
          }
        : null,
      notifications: [
        {
          id: `notif_${Date.now()}`,
          type: 'success',
          title: 'Вы приняты на работу!',
          message: `Вы устроились на должность ${jobTitle} в ${company}.`,
          date: formatGameDate(state.year, state.turn),
          isRead: false,
        },
        ...state.notifications,
      ],
    }))
  },
})
