import type { StateCreator } from 'zustand'
import type { GameStore, EducationSlice } from './types'
import type { ActiveCourse, ActiveUniversity } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'
import { formatGameDate } from '@/core/lib/quarter'

export const createEducationSlice: StateCreator<GameStore, [], [], EducationSlice> = (
  set,
  get,
) => ({
  studyCourse: (
    courseName: string,
    cost: number,
    costPerTurn: StatEffect,
    skillBonus: string,
    duration: number,
  ) => {
    const state = get()
    if (!state.player) return

    // ✅ Денежная проверка
    if (state.player.stats.money < cost) {
      set((state) => ({
        notifications: [
          {
            id: `err_${Date.now()}`,
            type: 'info',
            title: 'Недостаточно средств',
            message: 'У вас недостаточно денег для оплаты курса.',
            date: formatGameDate(state.year, state.turn),
            isRead: false,
          },
          ...state.notifications,
        ],
      }))
      return
    }

    // ✅ Подсчет текущих затрат энергии
    const currentEnergyCost =
      (state.player.personal.activeCourses || []).reduce(
        (acc, c) => acc + Math.abs(c.costPerTurn?.energy || 0),
        0,
      ) +
      (state.player.personal.activeUniversity || []).reduce(
        (acc, c) => acc + Math.abs(c.costPerTurn?.energy || 0),
        0,
      ) +
      state.player.jobs.reduce((acc, j) => acc + Math.abs(j.cost?.energy || 0), 0)

    const requiredEnergy = Math.abs(costPerTurn.energy || 0)

    if (state.player.stats.energy - currentEnergyCost < requiredEnergy) {
      set((state) => ({
        notifications: [
          {
            id: `err_${Date.now()}`,
            type: 'info',
            title: 'Недостаточно энергии',
            message: 'У вас недостаточно свободной энергии для обучения. Завершите другие дела.',
            date: formatGameDate(state.year, state.turn),
            isRead: false,
          },
          ...state.notifications,
        ],
      }))
      return
    }

    const normalizedSkillName = skillBonus.split('(')[0].trim()

    const newCourse: ActiveCourse = {
      id: `course_${Date.now()}`,
      courseName,
      skillName: normalizedSkillName,
      skillBonus: 0,
      totalDuration: duration,
      remainingDuration: duration,
      costPerTurn,
      startedTurn: state.turn,
    }

    set((state) => ({
      player: state.player
        ? {
            ...state.player,

            // ✅ HELLO NEW SYSTEM
            stats: {
              ...state.player.stats,
              money: state.player.stats.money - cost,
            },

            personal: {
              ...state.player.personal,
              activeCourses: [...state.player.personal.activeCourses, newCourse],
            },
          }
        : null,

      notifications: [
        {
          id: `course_${Date.now()}`,
          type: 'info',
          title: 'Запись на курс',
          message: `Вы записались на курс "${courseName}".`,
          date: formatGameDate(state.year, state.turn),
          isRead: false,
        },
        ...state.notifications,
      ],
    }))
  },

  applyToUniversity: (
    programName: string,
    cost: number,
    costPerTurn: StatEffect,
    skillBonus: string,
    duration: number,
  ) => {
    const state = get()
    if (!state.player) return

    // ✅ Денежная проверка
    if (state.player.stats.money < cost) {
      set((state) => ({
        notifications: [
          {
            id: `err_${Date.now()}`,
            type: 'info',
            title: 'Недостаточно средств',
            message: 'У вас недостаточно денег для оплаты обучения.',
            date: formatGameDate(state.year, state.turn),
            isRead: false,
          },
          ...state.notifications,
        ],
      }))
      return
    }

    // ✅ Подсчет текущих затрат энергии
    const currentEnergyCost =
      (state.player.personal.activeCourses || []).reduce(
        (acc, c) => acc + Math.abs(c.costPerTurn?.energy || 0),
        0,
      ) +
      (state.player.personal.activeUniversity || []).reduce(
        (acc, c) => acc + Math.abs(c.costPerTurn?.energy || 0),
        0,
      ) +
      state.player.jobs.reduce((acc, j) => acc + Math.abs(j.cost?.energy || 0), 0)

    const requiredEnergy = Math.abs(costPerTurn.energy || 0)

    if (state.player.stats.energy - currentEnergyCost < requiredEnergy) {
      set((state) => ({
        notifications: [
          {
            id: `err_${Date.now()}`,
            type: 'info',
            title: 'Недостаточно энергии',
            message: 'У вас недостаточно свободной энергии для обучения. Завершите другие дела.',
            date: formatGameDate(state.year, state.turn),
            isRead: false,
          },
          ...state.notifications,
        ],
      }))
      return
    }

    const normalizedSkillName = skillBonus.split('(')[0].trim()

    const newUni: ActiveUniversity = {
      id: `uni_${Date.now()}`,
      programName,
      skillName: normalizedSkillName,
      skillBonus: 0,
      totalDuration: duration,
      remainingDuration: duration,
      costPerTurn,
      startedTurn: state.turn,
    }

    set((state) => ({
      player: state.player
        ? {
            ...state.player,

            // ✅ HELLO NEW SYSTEM
            stats: {
              ...state.player.stats,
              money: state.player.stats.money - cost,
            },

            personal: {
              ...state.player.personal,
              activeUniversity: [...state.player.personal.activeUniversity, newUni],
            },
          }
        : null,

      notifications: [
        {
          id: `uni_${Date.now()}`,
          type: 'info',
          title: 'Поступление',
          message: `Вы поступили на программу "${programName}". Учеба займет ${duration} кв.`,
          date: formatGameDate(state.year, state.turn),
          isRead: false,
        },
        ...state.notifications,
      ],
    }))
  },
})
