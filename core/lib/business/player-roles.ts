import { getRoleConfig, isManagerialRole, isOperationalRole } from './employee-roles.config'

import type { Skill } from '@/core/types'
import type { Business, EmployeeRole } from '@/core/types/business.types'
import type { StatEffect } from '@/core/types/stats.types'

/**
 * Информация о росте навыка
 */
export interface SkillGrowthInfo {
  skillName: string
  progress: number
}

/**
 * Влияние игрока на бизнес
 */
export interface PlayerBusinessImpact {
  efficiencyBonus: number
  expenseReduction: number
  salesBonus: number
  reputationBonus: number
  taxReduction: number
  legalProtection: number
  staffProductivityBonus: number
}

/**
 * Проверить, выполняет ли игрок указанную роль в бизнесе
 */
export function playerHasRole(business: Business, role: EmployeeRole): boolean {
  const { managerialRoles, operationalRole } = business.playerRoles

  if (isManagerialRole(role)) {
    return managerialRoles.includes(role)
  }

  if (isOperationalRole(role)) {
    return operationalRole === role
  }

  return false
}

/**
 * Получить все активные роли игрока в бизнесе
 */
export function getPlayerActiveRoles(business: Business): EmployeeRole[] {
  const { managerialRoles, operationalRole } = business.playerRoles
  const roles = [...managerialRoles]

  if (operationalRole) {
    roles.push(operationalRole as EmployeeRole)
  }

  return roles
}

/**
 * Рассчитать эффекты всех ролей игрока на его статы
 */
export function calculatePlayerRoleEffects(business: Business): StatEffect {
  const activeRoles = getPlayerActiveRoles(business)

  const managerialEffect: StatEffect = {
    energy: 0,
    sanity: 0,
  }
  const operationalEffect: StatEffect = {
    energy: 0,
    sanity: 0,
  }

  activeRoles.forEach((role) => {
    const config = getRoleConfig(role)
    if (!config) return
    const effects = config.playerEffects

    if (isManagerialRole(role)) {
      managerialEffect.energy = (managerialEffect.energy || 0) + (effects.energy || 0)
      managerialEffect.sanity = (managerialEffect.sanity || 0) + (effects.sanity || 0)
      managerialEffect.happiness = (managerialEffect.happiness || 0) + (effects.happiness || 0)
      managerialEffect.health = (managerialEffect.health || 0) + (effects.health || 0)
      managerialEffect.intelligence =
        (managerialEffect.intelligence || 0) + (effects.intelligence || 0)
    } else if (isOperationalRole(role)) {
      operationalEffect.energy = (operationalEffect.energy || 0) + (effects.energy || 0)
      operationalEffect.sanity = (operationalEffect.sanity || 0) + (effects.sanity || 0)
      operationalEffect.happiness = (operationalEffect.happiness || 0) + (effects.happiness || 0)
      operationalEffect.health = (operationalEffect.health || 0) + (effects.health || 0)
      operationalEffect.intelligence =
        (operationalEffect.intelligence || 0) + (effects.intelligence || 0)
    }
  })

  const effortPercent = business.playerEmployment?.effortPercent ?? 100
  const effortFactor = Math.max(0.1, Math.min(1, effortPercent / 100))

  const totalEffect: StatEffect = {
    energy: (managerialEffect.energy || 0) * effortFactor + (operationalEffect.energy || 0),
    sanity: (managerialEffect.sanity || 0) * effortFactor + (operationalEffect.sanity || 0),
    happiness:
      (managerialEffect.happiness || 0) * effortFactor + (operationalEffect.happiness || 0),
    health: (managerialEffect.health || 0) * effortFactor + (operationalEffect.health || 0),
    intelligence:
      (managerialEffect.intelligence || 0) * effortFactor + (operationalEffect.intelligence || 0),
  }

  return totalEffect
}

/**
 * Получить информацию о росте навыков игрока за работу в ролях
 */
export function getPlayerRoleSkillGrowth(business: Business): SkillGrowthInfo[] {
  const activeRoles = getPlayerActiveRoles(business)
  const skillGrowth: SkillGrowthInfo[] = []

  const effortPercent = business.playerEmployment?.effortPercent ?? 100
  const effortFactor = Math.max(0.1, Math.min(1, effortPercent / 100))

  activeRoles.forEach((role) => {
    const config = getRoleConfig(role)
    if (config?.skillGrowth) {
      // Scale skill growth by effort factor for managerial roles
      const factor = isManagerialRole(role) ? effortFactor : 1
      skillGrowth.push({
        skillName: config.skillGrowth.name,
        progress: Math.round(config.skillGrowth.progressPerQuarter * factor),
      })
    }
  })

  return skillGrowth
}

/**
 * Рассчитать влияние навыков игрока на бизнес
 */
export function getPlayerRoleBusinessImpact(
  business: Business,
  playerSkills: Skill[],
): PlayerBusinessImpact {
  const activeRoles = getPlayerActiveRoles(business)

  const impact: PlayerBusinessImpact = {
    efficiencyBonus: 0,
    expenseReduction: 0,
    salesBonus: 0,
    reputationBonus: 0,
    taxReduction: 0,
    legalProtection: 0,
    staffProductivityBonus: 0,
  }

  const effortPercent = business.playerEmployment?.effortPercent ?? 100
  const effortFactor = Math.max(0.1, Math.min(1, effortPercent / 100))

  activeRoles.forEach((role) => {
    const config = getRoleConfig(role)
    if (!config?.businessImpact) return

    // Scale impact by effort factor for managerial roles
    const factor = isManagerialRole(role) ? effortFactor : 1

    // Найти соответствующий навык игрока
    const skillName = config.skillGrowth?.name
    const playerSkill = skillName ? playerSkills.find((s) => s.name === skillName) || null : null

    const roleImpact = config.businessImpact

    if (roleImpact.efficiencyBonus) {
      impact.efficiencyBonus += roleImpact.efficiencyBonus(playerSkill) * factor
    }

    if (roleImpact.expenseReduction) {
      impact.expenseReduction += roleImpact.expenseReduction(playerSkill) * factor
    }

    if (roleImpact.salesBonus) {
      impact.salesBonus += roleImpact.salesBonus(playerSkill) * factor
    }

    if (roleImpact.reputationBonus) {
      impact.reputationBonus += roleImpact.reputationBonus(playerSkill) * factor
    }
    if (roleImpact.taxReduction) {
      impact.taxReduction += roleImpact.taxReduction(playerSkill) * factor
    }
    if (roleImpact.legalProtection) {
      impact.legalProtection += roleImpact.legalProtection(playerSkill) * factor
    }
    if (roleImpact.staffProductivityBonus) {
      impact.staffProductivityBonus += roleImpact.staffProductivityBonus(playerSkill) * factor
    }
  })

  return impact
}

/**
 * Проверить, может ли игрок взять указанную роль
 * (для операционных ролей можно проверять наличие навыков)
 */
export function canPlayerTakeRole(role: EmployeeRole, playerSkills: Skill[]): boolean {
  const config = getRoleConfig(role)
  if (!config) return false

  // Управленческие роли может взять любой
  if (config.type === 'managerial') {
    return true
  }

  // Операционные роли - желательно иметь навык, но не обязательно
  // Игрок может работать и без навыка, но с низкой эффективностью
  return true
}

/**
 * Проверить, закрыта ли роль в бизнесе (есть сотрудник или игрок)
 */
export function isRoleFilled(business: Business, role: EmployeeRole): boolean {
  // Проверить, есть ли сотрудник на этой роли
  const hasEmployee = business.employees.some((e) => e.role === role)

  // Проверить, выполняет ли игрок эту роль
  const playerHas = playerHasRole(business, role)

  return hasEmployee || playerHas
}

/**
 * Проверить, выполнены ли минимальные требования к персоналу
 */
export function checkMinimumStaffing(business: Business): {
  isValid: boolean
  missingRoles: EmployeeRole[]
  totalEmployees: number
  requiredEmployees: number
  workerCount: number
  requiredWorkers: number
} {
  const requiredRoles = business.requiredRoles || []
  const minEmployees = business.minEmployees || 0

  // Проверить обязательные роли
  const missingRoles: EmployeeRole[] = []

  requiredRoles.forEach((role) => {
    if (!isRoleFilled(business, role)) {
      missingRoles.push(role)
    }
  })

  // Подсчитать общее количество "сотрудников" (включая игрока во всех ролях)
  const playerRolesCount =
    (business.playerRoles.managerialRoles?.length || 0) +
    (business.playerRoles.operationalRole ? 1 : 0)
  const totalEmployees = business.employees.length + playerRolesCount

  // Подсчитать только работников (worker)
  let workerCount = business.employees.filter((e) => e.role === 'worker').length

  // Если игрок выполняет роль worker, учитываем его
  if (business.playerRoles.operationalRole === 'worker') {
    workerCount += 1
  }

  // Проверка: выполнены обязательные роли И достаточно работников
  const isValid = missingRoles.length === 0 && workerCount >= minEmployees

  return {
    isValid,
    missingRoles,
    totalEmployees,
    requiredEmployees: minEmployees,
    workerCount,
    requiredWorkers: minEmployees,
  }
}

/**
 * Получить список ролей, которые игрок должен выполнять автоматически
 * (если нет сотрудников на этих ролях)
 */
export function getAutoAssignedManagerialRoles(business: Business): EmployeeRole[] {
  const autoRoles: EmployeeRole[] = []

  // Управляющий и Бухгалтер - обязательные роли по умолчанию
  const defaultRoles: EmployeeRole[] = ['manager', 'accountant', 'lawyer']

  defaultRoles.forEach((role) => {
    const hasEmployee = business.employees.some((e) => e.role === role)
    if (!hasEmployee) {
      autoRoles.push(role as EmployeeRole)
    }
  })

  return autoRoles
}

/**
 * Обновить роли игрока автоматически
 * (УДАЛЕНО: теперь игрок должен назначать себя сам)
 */
export function updateAutoAssignedRoles(business: Business): Business {
  // Теперь роли не назначаются автоматически. Игрок должен выбрать слот вручную.
  return business
}
