import { buffsStep } from './buffs.step'
import { businessStep } from './business.step'
import { economyStep } from './economy.step'
import { educationStep } from './education.step'
import { financialStep } from './financial.step'
import { historyStep } from './history.step'
import { inflationStep } from './inflation.step'
import { jobsStep } from './jobs.step'
import { lifestyleStep } from './lifestyle.step'
import { marketStep } from './market.step'
import { personalStep } from './personal.step'
import { thresholdsStep } from './thresholds.step'

export const STEPS = [
  marketStep,
  economyStep,
  educationStep,
  jobsStep,
  personalStep,
  businessStep,
  buffsStep,
  lifestyleStep,
  financialStep,
  thresholdsStep,
  historyStep,
  inflationStep,
] as const

export * from './buffs.step'
export * from './business.step'
export * from './economy.step'
export * from './education.step'
export * from './financial.step'
export * from './history.step'
export * from './inflation.step'
export * from './jobs.step'
export * from './lifestyle.step'
export * from './market.step'
export * from './personal.step'
export * from './thresholds.step'