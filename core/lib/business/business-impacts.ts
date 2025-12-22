import { getRoleConfig } from './employee-roles.config'
import { getPlayerRoleBusinessImpact } from './player-roles'
import type { Business } from '../../types/business.types'
import type { Skill } from '../../types/skill.types'

export interface TotalBusinessImpact {
  efficiencyBonus: number
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
  const impact: TotalBusinessImpact = {
    efficiencyBonus: 0,
    salesBonusPct: 0,
    taxReductionPct: 0,
    expenseReductionPct: 0,
    reputationBonus: 0,
    staffProductivityBonus: 0,
  }

  // 1. Employee Impacts (Additive)
  business.employees.forEach((emp) => {
    const cfg = getRoleConfig(emp.role)
    const staffImpact = cfg?.staffImpact ? cfg.staffImpact(emp.stars) : undefined
    if (!staffImpact) return

    const effortFactor = (emp.effortPercent ?? 100) / 100

    if (staffImpact.efficiencyBonus)
      impact.efficiencyBonus += staffImpact.efficiencyBonus * effortFactor
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

    impact.efficiencyBonus += playerImpact.efficiencyBonus
    impact.salesBonusPct += playerImpact.salesBonus
    impact.taxReductionPct += playerImpact.taxReduction
    impact.expenseReductionPct += playerImpact.expenseReduction
    impact.reputationBonus += playerImpact.reputationBonus
    impact.staffProductivityBonus += playerImpact.staffProductivityBonus
  }

  // Caps to prevent extreme values
  impact.taxReductionPct = Math.min(80, impact.taxReductionPct)
  impact.expenseReductionPct = Math.min(50, impact.expenseReductionPct)

  return impact
}
