import type { TurnStep } from '../turn/turn-step'
import { processLifestyle } from '../turns/lifestyle-processor'

export const lifestyleStep: TurnStep = (ctx, state) => {
  const res = processLifestyle(state.player, state.countries)

  state.player.personal.familyMembers = res.updatedFamilyMembers
  state.lifestyle.expenses = res.lifestyleExpenses
  state.lifestyle.breakdown = res.lifestyleExpensesBreakdown
  state.lifestyle.modifiers = res.modifiers
}
