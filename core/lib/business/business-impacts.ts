import type { Business } from '../../types/business.types'
import type { Skill } from '../../types/skill.types'
import { BUSINESS_BALANCE } from '../data-loaders/business-balance-loader'

import { getRoleConfig } from './employee-roles.config'
import { getPlayerRoleBusinessImpact } from './player-roles'

export interface TotalBusinessImpact {
  efficiencyBase: number // Сумма базовой эффективности (от рабочих, техников и т.д.)
  efficiencyMultiplierPct: number // Процентный бонус ко всей эффективности (от менеджеров, HR)
  salesBonusPct: number
  taxReductionPct: number
  expenseReductionPct: number
  reputationBonus: number
  staffProductivityBonus: number
}

/**
 * Calculates all combined impacts from employees and player roles for a business.
 * Ensures DRY compliance by unifying impact logic used in financials and metrics.
 */
export function calculateTotalBusinessImpact(
  business: Business,
  playerSkills?: Skill[],
): TotalBusinessImpact {
  const { metrics } = BUSINESS_BALANCE
  const impact: TotalBusinessImpact = {
    efficiencyBase: metrics.baseEfficiency, // Увеличено с 10, чтобы бизнес работал даже без сотрудников
    efficiencyMultiplierPct: 0,
    salesBonusPct: 0,
    taxReductionPct: 0,
    expenseReductionPct: 0,
    reputationBonus: metrics.baseReputationBonus, // Увеличено с 5
    staffProductivityBonus: 0,
  }

  // Если бизнес активен, но в нем нет сотрудников и игрока — он все равно имеет минимальную базу
  // Но если он в состоянии frozen/opening — база может быть другой.
  if (business.state !== 'active') {
    return { ...impact, efficiencyBase: 0, reputationBonus: 0 }
  }

  // 1. Employee Impacts (Additive)
  business.employees.forEach((emp) => {
    const cfg = getRoleConfig(emp.role)
    const staffImpact = cfg?.staffImpact ? cfg.staffImpact(emp.stars) : undefined
    if (!staffImpact) return

    const effortFactor = (emp.effortPercent ?? 100) / 100

    if (staffImpact.efficiencyBase)
      impact.efficiencyBase += staffImpact.efficiencyBase * effortFactor
    if (staffImpact.efficiencyMultiplier)
      impact.efficiencyMultiplierPct += staffImpact.efficiencyMultiplier * effortFactor
    if (staffImpact.salesBonus) impact.salesBonusPct += staffImpact.salesBonus * effortFactor
    if (staffImpact.taxReduction) impact.taxReductionPct += staffImpact.taxReduction * effortFactor
    if (staffImpact.expenseReduction)
      impact.expenseReductionPct += staffImpact.expenseReduction * effortFactor
    if (staffImpact.reputationBonus)
      impact.reputationBonus += staffImpact.reputationBonus * effortFactor
    if (staffImpact.staffProductivityBonus)
      impact.staffProductivityBonus += staffImpact.staffProductivityBonus * effortFactor
  })

  // 2. Player Impacts (Additive)
  if (playerSkills && playerSkills.length > 0) {
    const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills)

    impact.efficiencyBase += playerImpact.efficiencyBase
    impact.efficiencyMultiplierPct += playerImpact.efficiencyMultiplier
    impact.salesBonusPct += playerImpact.salesBonus
    impact.taxReductionPct += playerImpact.taxReduction
    impact.expenseReductionPct += playerImpact.expenseReduction
    impact.reputationBonus += playerImpact.reputationBonus
    impact.staffProductivityBonus += playerImpact.staffProductivityBonus
  }

  // Caps to prevent extreme values
  impact.taxReductionPct = Math.min(metrics.maxTaxReduction * 100, impact.taxReductionPct)
  impact.expenseReductionPct = Math.min(metrics.maxExpenseReduction * 100, impact.expenseReductionPct)

  return impact
}
