import type { Business } from '../../types/business.types'
import type { Skill } from '../../types/skill.types'
import { BUSINESS_BALANCE } from '../data-loaders/business-balance-loader'

import { calculateTotalBusinessImpact } from './business-impacts'
import { getRoleConfig } from './employee-roles.config'
import { checkMinimumStaffing, getTotalEmployeesCount } from './player-roles'


/**
 * Рассчитывает эффективность бизнеса (может быть > 100)
 */
export function calculateEfficiency(business: Business, playerSkills?: Skill[]): number {
  const { metrics } = BUSINESS_BALANCE
  const state = business.state ?? 'active'
  if (state !== 'active') return 0

  // 1. Проверка минимального персонала
  const staffingCheck = checkMinimumStaffing(business)
  // Убираем жесткий возврат 0, если персонал не дотягивает.
  // Вместо этого даем штраф к эффективности, но не обнуляем её совсем,
  // так как есть базовая автоматизация (efficiencyBase в impacts).
  const staffingPenalty = staffingCheck.isValid ? 1 : metrics.minStaffingPenalty

  // 2. Получаем консолидированные влияния (включая сотрудников и игрока)
  const impacts = calculateTotalBusinessImpact(business, playerSkills)

  // 3. Базовая эффективность
  let efficiency = (isNaN(impacts.efficiencyBase) ? 0 : impacts.efficiencyBase) * staffingPenalty

  // 4. Применяем множитель от менеджеров и HR (в процентах)
  const multiplier = isNaN(impacts.efficiencyMultiplierPct) ? 0 : impacts.efficiencyMultiplierPct
  if (multiplier > 0) {
    efficiency *= 1 + multiplier / 100
  }

  // 5. Влияние событий (последние 4 события)
  const recentEvents = (business.eventsHistory || []).slice(-4)
  const eventImpact = recentEvents.reduce((sum, event) => {
    const eff = event.effects.efficiency || 0
    return sum + (isNaN(eff) ? 0 : eff)
  }, 0)

  // Итоговая эффективность (без ограничения в 100%)
  const finalEfficiency = Math.max(0, efficiency + (isNaN(eventImpact) ? 0 : eventImpact))

  return Math.round(isNaN(finalEfficiency) ? 0 : finalEfficiency)
}

/**
 * Рассчитывает репутацию бизнеса (может быть > 100)
 */
export function calculateReputation(
  business: Business,
  currentEfficiency: number,
  playerSkills?: Skill[],
): number {
  const { metrics } = BUSINESS_BALANCE
  const EFFICIENCY_WEIGHT = metrics.efficiencyWeight // Вес эффективности в репутации
  const TEAM_STARS_WEIGHT = metrics.teamStarsWeight // Вес звезд команды в репутации

  // Репутация меняется медленно, стремясь к текущей эффективности
  // Но также зависит от маркетинга и событий

  // 1. Влияние эффективности (вес 60%)
  const efficiencyImpact = (isNaN(currentEfficiency) ? 0 : currentEfficiency) * EFFICIENCY_WEIGHT

  // 2. Влияние команды (звезды) (вес 20%)
  const totalSlots = getTotalEmployeesCount(business)

  let totalStars = business.employees.reduce((sum, e) => sum + (isNaN(e.stars) ? 3 : e.stars), 0)

  // Добавляем звезды игрока для каждой его роли
  const activeRoles = [
    ...(business.playerRoles.managerialRoles || []),
    ...(business.playerRoles.operationalRole ? [business.playerRoles.operationalRole] : []),
  ]

  activeRoles.forEach((role) => {
    const config = getRoleConfig(role)
    const skillName = config?.skillGrowth?.name
    const playerSkill =
      playerSkills && skillName ? playerSkills.find((s) => s.name === skillName) : null
    const stars = playerSkill ? Math.max(1, Math.min(5, playerSkill.level)) : 3
    totalStars += isNaN(stars) ? 3 : stars
  })

  const avgStars = totalSlots > 0 ? totalStars / totalSlots : 0
  const teamImpact = (isNaN(avgStars) ? 0 : avgStars / 5) * 100 * TEAM_STARS_WEIGHT // 5 звезд = 20 ед. репутации к базе

  // 3. Маркетинг и прямые бонусы репутации
  const impacts = calculateTotalBusinessImpact(business, playerSkills)
  const marketingAndPlayerBonus = isNaN(impacts.reputationBonus) ? 0 : impacts.reputationBonus

  // 5. События (прямое влияние)
  const recentEvents = (business.eventsHistory || []).slice(-4)
  const eventImpact = recentEvents.reduce((sum, event) => {
    const rep = event.effects.reputation || 0
    return sum + (isNaN(rep) ? 0 : rep)
  }, 0)

  // Целевая репутация
  const targetReputation =
    efficiencyImpact + teamImpact + marketingAndPlayerBonus + (isNaN(eventImpact) ? 0 : eventImpact)

  // Плавное изменение (сдвиг на 20% к цели каждый ход)
  const SMOOTHING_FACTOR = metrics.reputationSmoothing
  const currentRep = isNaN(business.reputation) ? 0 : business.reputation
  const newReputation = currentRep + (targetReputation - currentRep) * SMOOTHING_FACTOR

  // Итоговая репутация (без ограничения в 100%)
  return Math.max(0, Math.round(isNaN(newReputation) ? 0 : newReputation))
}

/**
 * Обновляет метрики бизнеса (эффективность, репутация)
 */
export function updateBusinessMetrics(business: Business, playerSkills?: Skill[]): Business {
  const efficiency = calculateEfficiency(business, playerSkills)
  const reputation = calculateReputation(business, efficiency, playerSkills)

  return {
    ...business,
    efficiency,
    reputation,
  }
}
