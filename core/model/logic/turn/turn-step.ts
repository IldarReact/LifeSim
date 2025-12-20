import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

export type TurnStep = (ctx: TurnContext, state: TurnState) => void

import { buffsStep } from '../steps/buffs.step'
import { businessStep } from '../steps/business.step'
import { economyStep } from '../steps/economy.step'
import { educationStep } from '../steps/education.step'
import { financialStep } from '../steps/financial.step'
import { inflationStep } from '../steps/inflation.step'
import { jobsStep } from '../steps/jobs.step'
import { lifestyleStep } from '../steps/lifestyle.step'
import { marketStep } from '../steps/market.step'
import { thresholdsStep } from '../steps/thresholds.step'

export const STEPS: TurnStep[] = [
  economyStep,
  marketStep,
  educationStep,
  jobsStep,
  businessStep,
  buffsStep,
  lifestyleStep,
  thresholdsStep,
  financialStep,
  inflationStep,
]
