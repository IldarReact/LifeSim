import { SKILL_STAR_DIVISOR, MONTHS_PER_QUARTER } from '../../shared-constants'

import type { EmployeeCandidate, Player, EmployeeStars, Skill, EmployeeSkills } from '@/core/types'

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
  playerData: { clientId: string; name: string; isLocal?: boolean },
  defaultRole: EmployeeCandidate['role'],
  customSalary: number,
  localPlayerStats?: Player, // Используем тип Player
): EmployeeCandidate {
  // Если это локальный игрок, используем его реальные данные
  if (playerData.isLocal && localPlayerStats) {
    const skills = localPlayerStats.personal.skills || []
    const stars = skills.length > 0 ? Math.max(1, ...skills.map((s) => s.level)) : 1

    return {
      id: `player_${playerData.clientId}`,
      name: playerData.name,
      role: defaultRole,
      stars: stars as EmployeeStars,
      experience: 24, // Можно тоже вычислять, если есть данные
      requestedSalary: customSalary,
      skills: skills.reduce((acc: EmployeeSkills, s: Skill) => ({ ...acc, [s.id]: s.level }), {
        efficiency: 100,
      } as EmployeeSkills),
      humanTraits: [], // Можно подтянуть из трейтов игрока
    }
  }

  // Для других игроков пока оставляем заглушку или базовые данные
  return {
    id: `player_${playerData.clientId}`,
    name: playerData.name,
    role: defaultRole,
    stars: 3,
    experience: 24,
    requestedSalary: customSalary,
    skills: {
      efficiency: 80,
    },
    humanTraits: ['ambitious', 'creative'],
  }
}
