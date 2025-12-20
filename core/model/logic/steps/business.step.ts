import { processBusinessTurn } from '../turns/business-turn-processor'
import type { TurnStep } from '../turn/turn-step'
import { formatGameDate } from '@/core/lib/quarter'

export const businessStep: TurnStep = (ctx, state) => {
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

  // Применяем затраты статов от ролей игрока
  state.statModifiers.energy = (state.statModifiers.energy || 0) - res.playerRoleEnergyCost
  state.statModifiers.sanity = (state.statModifiers.sanity || 0) - res.playerRoleSanityCost

  // Уведомление о значительных затратах статов
  if (res.playerRoleEnergyCost > 5 || res.playerRoleSanityCost > 5) {
    state.notifications.push({
      id: `biz_stats_cost_${ctx.turn}`,
      type: 'info',
      title: 'Управление бизнесом',
      message: `Участие в управлении вашими предприятиями потребовало ${res.playerRoleEnergyCost} энергии и ${res.playerRoleSanityCost} рассудка в этом квартале.`,
      date: formatGameDate(ctx.year, ctx.turn),
      isRead: false,
    })
  }

  res.protectedSkills.forEach((s) => state.protectedSkills.add(s))
  state.notifications.push(...res.notifications)
}
