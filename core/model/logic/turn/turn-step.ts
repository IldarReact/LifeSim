import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

export type TurnStep = (ctx: TurnContext, state: TurnState) => void

import { economyStep } from '../steps/economy.step'
import { marketStep } from '../steps/market.step'
import { educationStep } from '../steps/education.step'
import { jobsStep } from '../steps/jobs.step'
import { businessStep } from '../steps/business.step'
import { buffsStep } from '../steps/buffs.step'
import { lifestyleStep } from '../steps/lifestyle.step'
import { thresholdsStep } from '../steps/thresholds.step'
import { financialStep } from '../steps/financial.step'
import { inflationStep } from '../steps/inflation.step'

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
