import { SKILL_STAR_DIVISOR } from '@/features/activities/work/shared-constants'
import type { EmployeeSkills } from '@/core/types'

/**
 * Рассчитывает количество звезд на основе навыков.
 * Берет максимальный уровень среди всех навыков.
 */
export function calculateStarsFromSkills(skills?: EmployeeSkills): number {
  if (!skills || Object.keys(skills).length === 0) return 1
  
  const values = Object.values(skills)
  const maxSkill = Math.max(...values)
  
  // Используем тот же делитель, что и в остальных частях системы
  return Math.max(1, Math.min(5, Math.round(maxSkill / SKILL_STAR_DIVISOR)))
}

/**
 * Форматирует опыт в месяцах в строку "Xг Yм"
 */
export function formatExperience(months?: number): string {
  if (months === undefined || months === 0) return 'Без опыта'
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  
  let result = ''
  if (years > 0) result += `${years}г `
  if (remainingMonths > 0 || years === 0) result += `${remainingMonths}м`
  
  return result.trim()
}
