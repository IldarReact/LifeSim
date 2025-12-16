import { PlayerState } from '@/core/types'
import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'
import { processLifestyle } from '../turns/lifestyle-processor'

export function lifestyleStep(_: TurnContext, state: TurnState): void {
  const { processLifestyle } = require('../turns/lifestyle-processor')

  const res = processLifestyle(state.player, state.countries)

  state.player.personal.familyMembers = res.updatedFamilyMembers
  state.lifestyle.expenses = res.lifestyleExpenses
  state.lifestyle.breakdown = res.lifestyleExpensesBreakdown
  state.lifestyle.modifiers = res.modifiers
}

