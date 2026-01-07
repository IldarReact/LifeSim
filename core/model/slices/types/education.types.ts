import type { StatEffect } from '@/core/types/stats.types'

export interface EducationSlice {
  // Actions
  studyCourse: (
    courseName: string,
    cost: number,
    costPerTurn: StatEffect,
    skillBonus: string,
    duration: number,
  ) => void
  applyToUniversity: (
    programName: string,
    cost: number,
    costPerTurn: StatEffect,
    skillBonus: string,
    duration: number,
  ) => void
}
