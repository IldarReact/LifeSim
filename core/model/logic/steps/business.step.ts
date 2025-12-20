import type { TurnStep } from '../turn/turn-step'
import { processBusinessTurn } from '../turns/business-turn-processor'

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
  const energyCost = res.playerRoleEnergyCost
  if (typeof energyCost === 'number' && Number.isFinite(energyCost)) {
    state.statModifiers.energy = (state.statModifiers.energy || 0) - energyCost
  }
  const sanityCost = res.playerRoleSanityCost
  if (typeof sanityCost === 'number' && Number.isFinite(sanityCost)) {
    state.statModifiers.sanity = (state.statModifiers.sanity || 0) - sanityCost
  }

  // Уведомление о значительных затратах статов
  const notifyEnergy =
    typeof energyCost === 'number' && Number.isFinite(energyCost) ? energyCost : 0
  const notifySanity =
    typeof sanityCost === 'number' && Number.isFinite(sanityCost) ? sanityCost : 0
  if (notifyEnergy > 5 || notifySanity > 5) {
    state.notifications.push({
      id: `biz_stats_cost_${ctx.turn}`,
      type: 'info',
      title: 'Управление бизнесом',
      message: `Участие в управлении вашими предприятиями потребовало ${notifyEnergy} энергии и ${notifySanity} рассудка в этом квартале.`,
      date: formatGameDate(ctx.year, ctx.turn),
      isRead: false,
    })
  }

  res.protectedSkills.forEach((s) => state.protectedSkills.add(s))
  state.notifications.push(...res.notifications)
}
