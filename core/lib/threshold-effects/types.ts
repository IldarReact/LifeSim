import type { StatEffect } from '@/core/types/stats.types'

export interface ThresholdEffectsResult {
  canWork: boolean
  canStudy: boolean
  canManageBusiness: boolean

  medicalCosts: number
  therapyCosts: number

  events: Array<{
    type: 'health' | 'sanity' | 'intelligence' | 'happiness'
    severity: 'warning' | 'critical'
    message: string
  }>

  workEfficiency: number
  businessEfficiency: number
  learningEfficiency: number
}

export type ThresholdCheckInput = StatEffect
