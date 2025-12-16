import { processBusinessTurn } from '../business-turn-processor'
import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'

export function businessStep(ctx: TurnContext, state: TurnState): void {
  const res = processBusinessTurn(
    state.player.businesses,
    state.player.personal.skills,
    ctx.turn,
    ctx.year,
    state.globalMarketValue,
  )

  state.player.businesses = res.updatedBusinesses
  state.player.personal.skills = res.updatedSkills

  state.business.totalIncome = res.totalIncome
  state.business.totalExpenses = res.totalExpenses

  res.protectedSkills.forEach((s: string) => state.protectedSkills.add(s))

  state.notifications.push(...res.notifications)
}


