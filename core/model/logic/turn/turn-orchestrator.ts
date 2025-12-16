import { shopStep } from '../steps/shop.step'
import { economyStep } from '../steps/economy.step'
import { educationStep } from '../steps/education.step'
import { jobsStep } from '../steps/jobs.step'
import { personalStep } from '../steps/personal.step'
import { buffsStep } from '../steps/buffs.step'
import { thresholdsStep } from '../steps/thresholds.step'
import { inflationStep } from '../steps/inflation.step'
import { businessStep } from '../steps/business.step'
import { createTurnContext, type TurnContext } from './turn-context'
import { initTurnState } from './init-turn-state'
import { GameStore } from '../../slices'
import { financialStep } from '../steps'
import { commitTurn } from '../../logic/turn/commit-turn'

export function runTurn(prev: GameStore): Partial<GameStore> {
  const ctx = createTurnContext(prev)
  const state = initTurnState(ctx)

  shopStep(ctx, state)
  economyStep(ctx, state)
  educationStep(ctx, state)
  jobsStep(ctx, state)
  personalStep(ctx, state)
  businessStep(ctx, state)
  buffsStep(ctx, state)
  thresholdsStep(ctx, state)
  financialStep(ctx, state)
  inflationStep(ctx, state)

  return commitTurn(ctx, state)
}

