import type { PlayerState, StatModifiers, StatModifier } from '@/core/types'
import { StatEffect } from "@/core/types/stats.types";

/**
 * Собирает все модификаторы статов из разных источников
 */
export function calculateStatModifiers(player: PlayerState): StatModifiers {
  const modifiers: StatModifiers = {
    money: [],
    happiness: [],
    health: [],
    energy: [],
    sanity: [],
    intelligence: []
  }

  // Helper to push effects
  const pushEffects = (source: string, effects: StatEffect) => {
    if (effects.happiness) modifiers.happiness.push({ source, happiness: effects.happiness })
    if (effects.health) modifiers.health.push({ source, health: effects.health })
    if (effects.energy) modifiers.energy.push({ source, energy: effects.energy })
    if (effects.sanity) modifiers.sanity.push({ source, sanity: effects.sanity })
    if (effects.intelligence) modifiers.intelligence.push({ source, intelligence: effects.intelligence })
  }

  // Модификаторы от семьи
  player.personal.familyMembers?.forEach(member => {
    if (member.passiveEffects) {
      pushEffects(`Семья: ${member.name}`, member.passiveEffects)
    }
  })

  // Модификаторы от работы
  player.jobs?.forEach(job => {
    // Стоимость работы (обычно отрицательная энергия/здоровье)
    if (job.cost) {
      const effects: StatEffect = {}
      effects.happiness = job.cost.happiness
      effects.energy = job.cost.energy
      effects.health = job.cost.health
      effects.sanity = job.cost.sanity
      effects.intelligence = job.cost.intelligence

      pushEffects(`Работа: ${job.title}`, effects)
    }

    // Удовлетворение от работы влияет на счастье
    if (job.satisfaction) {
      const happinessMod = Math.round((job.satisfaction - 50) / 10)
      if (happinessMod !== 0) {
        modifiers.happiness.push({
          source: `Работа: ${job.title}`,
          happiness: happinessMod
        })
      }
    }
  })

  // Модификаторы от активных курсов
  player.personal.activeCourses?.forEach(course => {
    if (course.costPerTurn) {
      // Аналогично, costPerTurn - это затраты
      const effects: StatEffect = {}
      if (course.costPerTurn.energy) effects.energy = -course.costPerTurn.energy
      if (course.costPerTurn.health) effects.health = -course.costPerTurn.health
      if (course.costPerTurn.sanity) effects.sanity = -course.costPerTurn.sanity

      pushEffects(`Курс: ${course.courseName}`, effects)
    }
    // Обучение даёт интеллект (хардкод или из типа?)
    modifiers.intelligence.push({
      source: `Курс: ${course.courseName}`,
      intelligence: 1
    })
  })

  // Модификаторы от университета
  player.personal.activeUniversity?.forEach(uni => {
    if (uni.costPerTurn) {
      const effects: StatEffect = {}
      if (uni.costPerTurn.energy) effects.energy = -uni.costPerTurn.energy
      if (uni.costPerTurn.health) effects.health = -uni.costPerTurn.health
      if (uni.costPerTurn.sanity) effects.sanity = -uni.costPerTurn.sanity

      pushEffects(`Университет: ${uni.programName}`, effects)
    }
    // Университет даёт больше интеллекта
    modifiers.intelligence.push({
      source: `Университет: ${uni.programName}`,
      intelligence: 2
    })
    // Но может снижать рассудок из-за стресса (если не задано в costPerTurn)
    if (!uni.costPerTurn?.sanity) {
      modifiers.sanity.push({
        source: `Университет: ${uni.programName}`,
        sanity: -1
      })
    }
  })

  // Модификаторы от беременности
  if (player.personal.pregnancy) {
    modifiers.happiness.push({
      source: 'Беременность',
      happiness: 5
    })
    modifiers.energy.push({
      source: 'Беременность',
      energy: -10
    })
  }

  // Модификаторы от бизнеса (пока пропускаем, так как нет явных полей в типе Business)
  // Если нужно, можно добавить логику на основе playerRoles

  return modifiers
}

/**
 * Вычисляет суммарный модификатор для конкретного стата
 */
export function getTotalModifier(modifiers: StatModifier[], stat: keyof StatModifier): number {
  return modifiers.reduce((sum, mod) => {
    const value = mod[stat]
    return sum + (typeof value === 'number' ? value : 0)
  }, 0)
}
