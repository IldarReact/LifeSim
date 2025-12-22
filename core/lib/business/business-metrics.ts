import { checkMinimumStaffing, getTotalEmployeesCount } from './player-roles'
import { calculateTotalBusinessImpact } from './business-impacts'
import { getRoleConfig, isManagerialRole } from './employee-roles.config'

import type { Skill } from '../../types/skill.types'
import type { Business } from '../../types/business.types'

/**
 * Рассчитывает эффективность бизнеса (0-100)
 */
export function calculateEfficiency(business: Business, playerSkills?: Skill[]): number {
  const state = business.state ?? 'active'
  if (state !== 'active') return 0

  // 1. Проверка минимального персонала
  const staffingCheck = checkMinimumStaffing(business)
  if (!staffingCheck.isValid) {
    return 0
  }

  // 1.5. Бонус от HR (мотивация команды)
  const impacts = calculateTotalBusinessImpact(business, playerSkills)
  const hrProductivityBonus = impacts.staffProductivityBonus

  // 2. Базовая эффективность от сотрудников и игрока в операционных ролях
  let totalEfficiency = 0
  let managerBonus = 0

  // Вклад сотрудников
  business.employees.forEach((emp) => {
    const effortFactor = (emp.effortPercent ?? 100) / 100
    // HR повышает продуктивность всех сотрудников
    const effectiveProductivity = Math.min(100, emp.productivity + hrProductivityBonus)
    const contribution = emp.skills.efficiency * (effectiveProductivity / 100) * effortFactor

    if (emp.role === 'manager') {
      managerBonus += (emp.skills.efficiency / 100) * 10 * effortFactor // До +10% от каждого менеджера
    }

    totalEfficiency += contribution
  })

  // Вклад игрока в операционной роли (если есть)
  if (business.playerRoles.operationalRole) {
    const role = business.playerRoles.operationalRole
    const config = getRoleConfig(role)
    if (config) {
      // Для игрока в операционной роли считаем вклад как 100% эффективность + бонусы от навыков
      const baseContribution = 80 // Базовый вклад игрока
      const skillContribution = impacts.efficiencyBonus // Use consolidated efficiency bonus
      totalEfficiency += baseContribution + skillContribution
    }
  }

  // Средняя эффективность команды
  // Считаем только тех, кто вносил вклад в totalEfficiency (сотрудники + игрок в операционной роли)
  // Управленческие роли игрока добавляют свои бонусы отдельно (шаг 4) и не должны размывать среднее
  const operationalSlots =
    business.employees.length + (business.playerRoles.operationalRole ? 1 : 0)
  let avgEfficiency = operationalSlots > 0 ? totalEfficiency / operationalSlots : 0

  // 3. Бонус менеджера
  avgEfficiency += managerBonus

  // 4. ✅ Влияние управленческих ролей игрока
  // (Now included in managerBonus or handled separately)
  // We already added impacts.efficiencyBonus to player contribution if they are in operational role.
  // If player is in managerial role, it should also be added.
  if (!business.playerRoles.operationalRole) {
    avgEfficiency += impacts.efficiencyBonus
  }

  // 5. Влияние событий (последние 4 события)
  const recentEvents = (business.eventsHistory || []).slice(-4)
  const eventImpact = recentEvents.reduce((sum, event) => sum + (event.effects.efficiency || 0), 0)

  // Итоговая эффективность
  const finalEfficiency = Math.min(100, Math.max(0, avgEfficiency + eventImpact))

  return Math.round(finalEfficiency)
}

/**
 * Рассчитывает репутацию бизнеса (0-100)
 */
export function calculateReputation(
  business: Business,
  currentEfficiency: number,
  playerSkills?: Skill[],
): number {
  // Репутация меняется медленно, стремясь к текущей эффективности
  // Но также зависит от маркетинга и событий

  // 1. Влияние эффективности (вес 60%)
  const efficiencyImpact = currentEfficiency * 0.6

  // 2. Влияние команды (звезды) (вес 20%)
  const totalSlots = getTotalEmployeesCount(business)

  let totalStars = business.employees.reduce((sum, e) => sum + e.stars, 0)

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
    totalStars += stars
  })

  const avgStars = totalSlots > 0 ? totalStars / totalSlots : 0
  const teamImpact = (avgStars / 5) * 100 * 0.2 // 5 звезд = 100 * 0.2 = 20

  // 3. Маркетинг и прямые бонусы репутации (вес 20%)
  // Мы используем reputationBonus из impacts, который уже включает вклад маркетологов и игрока
  const impacts = calculateTotalBusinessImpact(business, playerSkills)
  const marketingAndPlayerBonus = impacts.reputationBonus

  // 5. События (прямое влияние)
  const recentEvents = (business.eventsHistory || []).slice(-4)
  const eventImpact = recentEvents.reduce((sum, event) => sum + (event.effects.reputation || 0), 0)

  // Целевая репутация
  const targetReputation = efficiencyImpact + teamImpact + marketingAndPlayerBonus + eventImpact

  // Плавное изменение (сдвиг на 10% к цели каждый ход)
  const newReputation = business.reputation + (targetReputation - business.reputation) * 0.1

  return Math.min(100, Math.max(0, Math.round(newReputation)))
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
