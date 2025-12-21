import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

export type TurnStep = (ctx: TurnContext, state: TurnState) => void

import {
  buffsStep,
  businessStep,
  economyStep,
  educationStep,
  financialStep,
  inflationStep,
  jobsStep,
  lifestyleStep,
  marketStep,
  thresholdsStep,
} from '../steps/'

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
