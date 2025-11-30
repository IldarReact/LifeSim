import type { PlayerState, StatModifier, Stats } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'
import { EMPLOYEE_ROLES_CONFIG } from '@/features/business/config/employee-roles.config'

/**
 * Собирает все пакетные модификаторы статов игрока
 */
export function calculateStatModifiers(player: PlayerState): StatModifier[] {
  const modifiers: StatModifier[] = []

  const push = (source: string, effects: StatEffect) => {
    if (Object.keys(effects).length > 0) {
      modifiers.push({ source, effects })
    }
  }

  // ---------------------------------
  // СЕМЬЯ
  // ---------------------------------
  player.personal.familyMembers?.forEach(member => {
    push(`Семья: ${member.name}`, member.passiveEffects || {})
  })

  // ---------------------------------
  // РАБОТА
  // ---------------------------------
  player.jobs?.forEach(job => {
    const effects: StatEffect = { ...(job.cost || {}) }

    if (job.satisfaction !== undefined) {
      effects.happiness =
        (effects.happiness || 0) +
        Math.round((job.satisfaction - 50) / 10)
    }

    push(`Работа: ${job.title}`, effects)
  })

  // ---------------------------------
  // КУРСЫ
  // ---------------------------------
  player.personal.activeCourses?.forEach(course => {
    push(`Курс: ${course.courseName}`, {
      ...(course.costPerTurn || {}),
      intelligence: (course.costPerTurn?.intelligence || 0) + 1,
    })
  })

  // ---------------------------------
  // УНИВЕРСИТЕТ
  // ---------------------------------
  player.personal.activeUniversity?.forEach(uni => {
    push(`Университет: ${uni.programName}`, {
      ...(uni.costPerTurn || {}),
      intelligence: (uni.costPerTurn?.intelligence || 0) + 2,
      sanity: (uni.costPerTurn?.sanity || 0) - 1,
    })
  })

  // ---------------------------------
  // БЕРЕМЕННОСТЬ
  // ---------------------------------
  if (player.personal.pregnancy) {
    push(`Беременность`, {
      happiness: 5,
      energy: -10,
    })
  }

  // ---------------------------------
  // БИЗНЕС: РОЛИ ИГРОКА
  // ---------------------------------
  player.businesses?.forEach(business => {
    const roles = business.playerRoles

    // --- Управленческие роли ---
    roles?.managerialRoles?.forEach(role => {
      const config = EMPLOYEE_ROLES_CONFIG[role]

      if (!config?.playerEffects) return

      push(
        `Бизнес: ${config.name} (${business.name})`,
        config.playerEffects
      )
    })

    // --- Операционная роль ---
    if (roles?.operationalRole) {
      const config =
        EMPLOYEE_ROLES_CONFIG[roles.operationalRole]

      if (config?.playerEffects) {
        push(
          `Бизнес: ${config.name} (${business.name})`,
          config.playerEffects
        )
      }
    }
  })

  return modifiers
}

/**
 * Считает суммарный эффект для конкретного стата
 */
export function getTotalModifier(
  modifiers: StatModifier[],
  stat: keyof Stats
): number {
  return modifiers.reduce((sum, mod) => {
    return sum + (mod.effects[stat] ?? 0)
  }, 0)
}
