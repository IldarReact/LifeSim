import type { Business, EmployeeRole, PlayerBusinessImpact } from '../../../types/business.types'
import type { Skill } from '../../../types/skill.types'
import type { StatEffect } from '../../../types/stats.types'
import { getRoleConfig, isManagerialRole, isOperationalRole } from '../employee-roles.config'

import { getPlayerActiveRoles } from './role-utils'

/**
 * Информация о росте навыка
 */
export interface SkillGrowthInfo {
  skillName: string
  progress: number
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
    efficiencyBase: 0,
    efficiencyMultiplier: 0,
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

    if (roleImpact.efficiencyBase) {
      impact.efficiencyBase += roleImpact.efficiencyBase(playerSkill) * factor
    }

    if (roleImpact.efficiencyMultiplier) {
      impact.efficiencyMultiplier += roleImpact.efficiencyMultiplier(playerSkill) * factor
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
 * Рассчитать влияние конкретной роли игрока на бизнес
 */
export function getSingleRoleImpact(
  role: EmployeeRole,
  playerSkills: Skill[],
  effortPercent: number = 100,
): PlayerBusinessImpact {
  const impact: PlayerBusinessImpact = {
    efficiencyBase: 0,
    efficiencyMultiplier: 0,
    expenseReduction: 0,
    salesBonus: 0,
    reputationBonus: 0,
    taxReduction: 0,
    legalProtection: 0,
    staffProductivityBonus: 0,
  }

  const config = getRoleConfig(role)
  if (!config?.businessImpact) return impact

  const factor = isManagerialRole(role) ? Math.max(0.1, Math.min(1, effortPercent / 100)) : 1
  const skillName = config.skillGrowth?.name
  const playerSkill = skillName ? playerSkills.find((s) => s.name === skillName) || null : null

  const roleImpact = config.businessImpact

  if (roleImpact.efficiencyBase) {
    impact.efficiencyBase = roleImpact.efficiencyBase(playerSkill) * factor
  }
  if (roleImpact.efficiencyMultiplier) {
    impact.efficiencyMultiplier = roleImpact.efficiencyMultiplier(playerSkill) * factor
  }
  if (roleImpact.expenseReduction) {
    impact.expenseReduction = roleImpact.expenseReduction(playerSkill) * factor
  }
  if (roleImpact.salesBonus) {
    impact.salesBonus = roleImpact.salesBonus(playerSkill) * factor
  }
  if (roleImpact.reputationBonus) {
    impact.reputationBonus = roleImpact.reputationBonus(playerSkill) * factor
  }
  if (roleImpact.taxReduction) {
    impact.taxReduction = roleImpact.taxReduction(playerSkill) * factor
  }
  if (roleImpact.legalProtection) {
    impact.legalProtection = roleImpact.legalProtection(playerSkill) * factor
  }
  if (roleImpact.staffProductivityBonus) {
    impact.staffProductivityBonus = roleImpact.staffProductivityBonus(playerSkill) * factor
  }

  return impact
}
