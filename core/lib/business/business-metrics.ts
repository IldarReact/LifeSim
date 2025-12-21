import {
  checkMinimumStaffing,
  getPlayerRoleBusinessImpact,
  getTotalEmployeesCount,
} from './player-roles'
import { getRoleConfig, isManagerialRole } from './employee-roles.config'

import type { Skill } from '@/core/types'
import type { Business } from '@/core/types/business.types'

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
  let hrProductivityBonus = 0

  // Бонус от игрока, если он HR
  if (playerSkills && playerSkills.length > 0) {
    const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills)
    hrProductivityBonus += playerImpact.staffProductivityBonus || 0
  }

  // Бонус от сотрудников
  business.employees.forEach((emp) => {
    const cfg = getRoleConfig(emp.role)
    const impact = cfg?.staffImpact ? cfg.staffImpact(emp.stars) : undefined
    if (impact?.staffProductivityBonus) {
      const effortFactor = (emp.effortPercent ?? 100) / 100
      hrProductivityBonus += impact.staffProductivityBonus * effortFactor
    }
  })

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
      const playerImpact = playerSkills ? getPlayerRoleBusinessImpact(business, playerSkills) : null
      const baseContribution = 80 // Базовый вклад игрока
      const skillContribution = playerImpact?.efficiencyBonus || 0
      totalEfficiency += baseContribution + skillContribution
    }
  }

  // Средняя эффективность команды
  const totalSlots = getTotalEmployeesCount(business)
  let avgEfficiency = totalSlots > 0 ? totalEfficiency / totalSlots : 0

  // 3. Бонус менеджера
  avgEfficiency += managerBonus

  // 4. ✅ Влияние управленческих ролей игрока
  if (playerSkills && playerSkills.length > 0) {
    const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills)
    // efficiencyBonus из impact теперь включает только бонусы от управленческих ролей
    // так как операционный вклад мы учли выше
    avgEfficiency += playerImpact.efficiencyBonus
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

  // 3. Маркетологи (вес 20%)
  const employeeMarketers = business.employees.filter((e) => e.role === 'marketer')
  let totalMarketingEfficiency = employeeMarketers.reduce((sum, m) => sum + m.skills.efficiency, 0)
  let marketingCount = employeeMarketers.length

  // Если игрок маркетолог
  if (business.playerRoles.managerialRoles?.includes('marketer')) {
    const playerImpact = playerSkills ? getPlayerRoleBusinessImpact(business, playerSkills) : null
    totalMarketingEfficiency += 70 + (playerImpact?.salesBonus || 0) // Условная эффективность игрока
    marketingCount += 1
  }

  const marketingImpact = marketingCount > 0 ? (totalMarketingEfficiency / marketingCount) * 0.2 : 0

  // 4. ✅ НОВОЕ: Влияние навыков игрока на репутацию (прямой бонус)
  let playerReputationBonus = 0
  if (playerSkills && playerSkills.length > 0) {
    const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills)
    playerReputationBonus = playerImpact.reputationBonus
  }

  // 5. События (прямое влияние)
  const recentEvents = (business.eventsHistory || []).slice(-4)
  const eventImpact = recentEvents.reduce((sum, event) => sum + (event.effects.reputation || 0), 0)

  // Целевая репутация
  const targetReputation =
    efficiencyImpact + teamImpact + marketingImpact + playerReputationBonus + eventImpact

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
