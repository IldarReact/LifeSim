import type { StaffImpactResult, EmployeeRole } from '../../types/business.types'
import type { Skill } from '../../types/skill.types'
import type { StatEffect } from '../../types/stats.types'

import rolesData from '@/shared/data/business/roles.json'

/**
 * Тип роли: управленческая или операционная
 * - managerial: можно выполнять несколько одновременно (частично)
 * - operational: только одна роль, полный рабочий день
 */
export type RoleType = 'managerial' | 'operational'

/**
 * Влияние роли на бизнес
 */
export interface BusinessImpact {
  efficiencyBase?: (skill: Skill | null) => number
  efficiencyMultiplier?: (skill: Skill | null) => number
  expenseReduction?: (skill: Skill | null) => number
  salesBonus?: (skill: Skill | null) => number
  reputationBonus?: (skill: Skill | null) => number
  taxReduction?: (skill: Skill | null) => number
  legalProtection?: (skill: Skill | null) => number
  staffProductivityBonus?: (skill: Skill | null) => number
}

/**
 * Конфигурация роли сотрудника
 */
export interface EmployeeRoleConfig {
  type: RoleType
  name: string
  description: string

  // Эффекты на игрока, если он выполняет эту роль
  playerEffects: StatEffect

  // Рост навыка при работе в роли
  skillGrowth: {
    name: string
    progressPerQuarter: number
  } | null

  // Влияние навыка игрока на бизнес (если он работает в этой роли)
  businessImpact?: BusinessImpact
  staffImpact?: (stars: number) => StaffImpactResult
}

interface RawRoleData {
  type: RoleType
  name: string
  description: string
  playerEffects: StatEffect
  skillGrowth: {
    name: string
    progressPerQuarter: number
  } | null
  impactCoefficients: Record<string, number>
}

/**
 * Конфигурация всех ролей сотрудников
 */
export const EMPLOYEE_ROLES_CONFIG: Record<string, EmployeeRoleConfig> = {
  // ============================================
  // УПРАВЛЕНЧЕСКИЕ РОЛИ (можно несколько сразу)
  // ============================================

  manager: {
    ...(rolesData.manager as unknown as RawRoleData),
    businessImpact: {
      efficiencyMultiplier: (skill) =>
        skill ? skill.level * rolesData.manager.impactCoefficients.efficiencyMultiplier : 0,
    },
    staffImpact: (stars) => ({
      efficiencyMultiplier: stars * rolesData.manager.impactCoefficients.staffEfficiencyMultiplier,
    }),
  },

  accountant: {
    ...(rolesData.accountant as unknown as RawRoleData),
    businessImpact: {
      taxReduction: (skill) =>
        skill ? skill.level * rolesData.accountant.impactCoefficients.taxReduction : 0,
    },
    staffImpact: (stars) => ({
      taxReduction: stars * rolesData.accountant.impactCoefficients.staffTaxReduction,
    }),
  },

  marketer: {
    ...(rolesData.marketer as unknown as RawRoleData),
    businessImpact: {
      reputationBonus: (skill) =>
        skill ? skill.level * rolesData.marketer.impactCoefficients.reputationBonus : 0,
      salesBonus: (skill) =>
        skill ? skill.level * rolesData.marketer.impactCoefficients.salesBonus : 0,
    },
    staffImpact: (stars) => ({
      salesBonus: stars * rolesData.marketer.impactCoefficients.staffSalesBonus,
      reputationBonus: stars * rolesData.marketer.impactCoefficients.staffReputationBonus,
    }),
  },

  lawyer: {
    ...(rolesData.lawyer as unknown as RawRoleData),
    businessImpact: {
      taxReduction: (skill) =>
        skill ? skill.level * rolesData.lawyer.impactCoefficients.taxReduction : 0,
      expenseReduction: (skill) =>
        skill ? skill.level * rolesData.lawyer.impactCoefficients.expenseReduction : 0,
      legalProtection: (skill) =>
        skill ? skill.level * rolesData.lawyer.impactCoefficients.legalProtection : 0,
    },
    staffImpact: (stars) => ({
      taxReduction: stars * rolesData.lawyer.impactCoefficients.staffTaxReduction,
      expenseReduction: stars * rolesData.lawyer.impactCoefficients.staffExpenseReduction,
      legalProtection: stars * rolesData.lawyer.impactCoefficients.staffLegalProtection,
    }),
  },

  hr: {
    ...(rolesData.hr as unknown as RawRoleData),
    businessImpact: {
      efficiencyMultiplier: (skill) =>
        skill ? skill.level * rolesData.hr.impactCoefficients.efficiencyMultiplier : 0,
      staffProductivityBonus: (skill) =>
        skill ? skill.level * rolesData.hr.impactCoefficients.staffProductivityBonus : 0,
    },
    staffImpact: (stars) => ({
      efficiencyMultiplier: stars * rolesData.hr.impactCoefficients.staffEfficiencyMultiplier,
      staffProductivityBonus: stars * rolesData.hr.impactCoefficients.staffStaffProductivityBonus,
    }),
  },

  // ============================================
  // ОПЕРАЦИОННЫЕ РОЛИ (только одна, полный день)
  // ============================================

  salesperson: {
    ...(rolesData.salesperson as unknown as RawRoleData),
    businessImpact: {
      salesBonus: (skill) =>
        skill
          ? skill.level * rolesData.salesperson.impactCoefficients.salesBonusPerLevel
          : rolesData.salesperson.impactCoefficients.salesBonusMin,
    },
    staffImpact: (stars) => ({
      salesBonus: stars * rolesData.salesperson.impactCoefficients.staffSalesBonus,
    }),
  },

  technician: {
    ...(rolesData.technician as unknown as RawRoleData),
    businessImpact: {
      efficiencyMultiplier: (skill) =>
        skill
          ? skill.level * rolesData.technician.impactCoefficients.efficiencyBasePerLevel
          : rolesData.technician.impactCoefficients.efficiencyBaseMin,
    },
    staffImpact: (stars) => ({
      efficiencyMultiplier:
        rolesData.technician.impactCoefficients.staffEfficiencyBase *
        (1 + rolesData.technician.impactCoefficients.staffEfficiencyStarBonus * stars),
    }),
  },

  worker: {
    ...(rolesData.worker as unknown as RawRoleData),
    businessImpact: {
      efficiencyBase: () => rolesData.worker.impactCoefficients.playerEfficiencyBase,
    },
    staffImpact: (stars) => ({
      efficiencyBase:
        rolesData.worker.impactCoefficients.staffEfficiencyBase *
        (1 + rolesData.worker.impactCoefficients.staffEfficiencyStarBonus * stars),
    }),
  },
}

/**
 * Получить конфиг роли
 */
export function getRoleConfig(role: string): EmployeeRoleConfig | undefined {
  return EMPLOYEE_ROLES_CONFIG[role]
}

/**
 * Проверить, является ли роль управленческой
 */
export function isManagerialRole(role: string): boolean {
  const config = getRoleConfig(role)
  return config?.type === 'managerial'
}

/**
 * Проверить, является ли роль операционной
 */
export function isOperationalRole(role: string): boolean {
  const config = getRoleConfig(role)
  return config?.type === 'operational'
}

/**
 * Получить список всех управленческих ролей
 */
export function getManagerialRoles(): EmployeeRole[] {
  return Object.keys(EMPLOYEE_ROLES_CONFIG).filter(isManagerialRole) as EmployeeRole[]
}

/**
 * Получить список всех операционных ролей
 */
export function getOperationalRoles(): EmployeeRole[] {
  return Object.keys(EMPLOYEE_ROLES_CONFIG).filter(isOperationalRole) as EmployeeRole[]
}
