import type { StateCreator } from 'zustand'
import type { GameStore, EducationSlice } from './types'
import type { ActiveCourse, ActiveUniversity } from '@/core/types'

export const createEducationSlice: StateCreator<
  GameStore,
  [],
  [],
  EducationSlice
> = (set, get) => ({
  // Actions
  studyCourse: (courseName: string, cost: number, energyCost: number, skillBonus: string, duration: number) => {
    const state = get()
    if (!state.player) return

    if (state.player.cash < cost) {
      set(state => ({
        notifications: [{
          id: `err_${Date.now()}`,
          type: 'info',
          title: 'Недостаточно средств',
          message: 'У вас недостаточно денег для оплаты курса.',
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }))
      return
    }

    const currentEnergyCost = (state.player.personal.activeCourses || []).reduce((acc, c) => acc + c.energyCostPerTurn, 0) +
                              (state.player.personal.activeUniversity || []).reduce((acc, c) => acc + c.energyCostPerTurn, 0) +
                              state.player.jobs.reduce((acc, j) => acc + j.energyCost, 0)
    
    if (100 - currentEnergyCost < energyCost) {
      set(state => ({
        notifications: [{
          id: `err_${Date.now()}`,
          type: 'info',
          title: 'Недостаточно энергии',
          message: 'У вас недостаточно свободной энергии для обучения. Завершите другие дела.',
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
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
      energyCostPerTurn: energyCost,
      startedTurn: state.turn
    }

    set(state => ({
      player: state.player ? {
        ...state.player,
        cash: state.player.cash - cost,
        personal: {
          ...state.player.personal,
          activeCourses: [...state.player.personal.activeCourses, newCourse]
        }
      } : null,
      notifications: [{
        id: `course_${Date.now()}`,
        type: 'info',
        title: 'Запись на курс',
        message: `Вы записались на курс "${courseName}".`,
        date: `${state.year} Q${(state.turn % 4) || 4}`,
        isRead: false
      }, ...state.notifications]
    }))
  },

  applyToUniversity: (programName: string, cost: number, energyCost: number, skillBonus: string, duration: number) => {
    const state = get()
    if (!state.player) return

    if (state.player.cash < cost) {
      set(state => ({
        notifications: [{
          id: `err_${Date.now()}`,
          type: 'info',
          title: 'Недостаточно средств',
          message: 'У вас недостаточно денег для оплаты обучения.',
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
      }))
      return
    }

    const currentEnergyCost = (state.player.personal.activeCourses || []).reduce((acc, c) => acc + c.energyCostPerTurn, 0) +
                              (state.player.personal.activeUniversity || []).reduce((acc, c) => acc + c.energyCostPerTurn, 0) +
                              state.player.jobs.reduce((acc, j) => acc + j.energyCost, 0)
    
    if (100 - currentEnergyCost < energyCost) {
      set(state => ({
        notifications: [{
          id: `err_${Date.now()}`,
          type: 'info',
          title: 'Недостаточно энергии',
          message: 'У вас недостаточно свободной энергии для обучения. Завершите другие дела.',
          date: `${state.year} Q${(state.turn % 4) || 4}`,
          isRead: false
        }, ...state.notifications]
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
      energyCostPerTurn: energyCost,
      startedTurn: state.turn
    }

    set(state => ({
      player: state.player ? {
        ...state.player,
        cash: state.player.cash - cost,
        personal: {
          ...state.player.personal,
          activeUniversity: [...state.player.personal.activeUniversity, newUni]
        }
      } : null,
      notifications: [{
        id: `uni_${Date.now()}`,
        type: 'info',
        title: 'Поступление',
        message: `Вы поступили на программу "${programName}". Учеба займет ${duration} кв.`,
        date: `${state.year} Q${(state.turn % 4) || 4}`,
        isRead: false
      }, ...state.notifications]
    }))
  }
})
