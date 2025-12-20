import { economyStep } from './economy.step'
import { marketStep } from './market.step'
import { educationStep } from './education.step'
import { jobsStep } from './jobs.step'
import { personalStep } from './personal.step'
import { businessStep } from './business.step'
import { buffsStep } from './buffs.step'
import { lifestyleStep } from './lifestyle.step'
import { financialStep } from './financial.step'
import { thresholdsStep } from './thresholds.step'
import { inflationStep } from './inflation.step'
import { historyStep } from './history.step'

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
