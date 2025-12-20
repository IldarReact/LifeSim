import { SKILL_STAR_DIVISOR, MONTHS_PER_QUARTER } from "../../shared-constants"

import type { EmployeeCandidate } from "@/core/types"

export function getSkillStarsCount(value: number): number {
  return Math.round(value / SKILL_STAR_DIVISOR)
}

export function calculateMonthlySalary(quarterlySalary: number): number {
  return Math.round(quarterlySalary / MONTHS_PER_QUARTER)
}

export function calculateMaxSalaryWithKPI(salary: number, kpiPercent: number): number {
  return salary + Math.round(salary * (kpiPercent / 100))
}

export function calculateKPIBonus(salary: number, kpiPercent: number): number {
  return Math.round(salary * (kpiPercent / 100))
}

export function createPlayerCandidate(
  player: { clientId: string; name: string },
  defaultRole: EmployeeCandidate['role'],
  customSalary: number
): EmployeeCandidate {
  return {
    id: `player_${player.clientId}`,
    name: player.name,
    role: defaultRole,
    stars: 3,
    experience: 24,
    requestedSalary: customSalary,
    skills: {
      efficiency: 80
    },
    humanTraits: ['ambitious', 'creative']
  }
}
