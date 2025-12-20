import type { TurnStep } from '../turn/turn-step'
import { processFinancials } from '../turns/financial-processor'

export const financialStep: TurnStep = (ctx, state) => {
  const res = processFinancials(
    ctx.prev,
    state.player.countryId,
    state.player.personal.familyMembers,
    state.lifestyle.expenses,
    state.lifestyle.breakdown,
    state.business,
    state.statModifiers.income || 0,
  )

  state.financial.quarterlyReport = res.quarterlyReport
  state.financial.netProfit = res.netProfit
  state.financial.adjustedNetProfit = res.netProfit
  state.country = res.country
}
