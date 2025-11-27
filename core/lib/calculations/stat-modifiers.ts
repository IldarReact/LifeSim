import type { PlayerState, StatModifiers, StatModifier } from '@/core/types'

/**
 * Собирает все модификаторы статов из разных источников
 */
export function calculateStatModifiers(player: PlayerState): StatModifiers {
  const modifiers: StatModifiers = {
    happiness: [],
    health: [],
    energy: [],
    sanity: [],
    intelligence: []
  }

  // Модификаторы от семьи
  player.personal.familyMembers?.forEach(member => {
    if (member.happinessMod !== 0) {
      modifiers.happiness.push({
        source: `Семья: ${member.name}`,
        happiness: member.happinessMod
      })
    }
    if (member.sanityMod !== 0) {
      modifiers.sanity.push({
        source: `Семья: ${member.name}`,
        sanity: member.sanityMod
      })
    }
    if (member.healthMod !== 0) {
      modifiers.health.push({
        source: `Семья: ${member.name}`,
        health: member.healthMod
      })
    }
  })


  // Модификаторы от работы
  player.jobs?.forEach(job => {
    // Энергия от работы
    if (job.energyCost) {
      modifiers.energy.push({
        source: `Работа: ${job.title}`,
        energy: -job.energyCost
      })
    }

    // Удовлетворение от работы влияет на счастье
    if (job.satisfaction) {
      const happinessMod = Math.round((job.satisfaction - 50) / 10) // 50-60 = +1, 60-70 = +2, etc.
      if (happinessMod !== 0) {
        modifiers.happiness.push({
          source: `Работа: ${job.title}`,
          happiness: happinessMod
        })
      }
    }

    // Ментальное здоровье от работы влияет на рассудок
    if (job.mentalHealthImpact !== undefined && job.mentalHealthImpact !== 0) {
      modifiers.sanity.push({
        source: `Работа: ${job.title}`,
        sanity: job.mentalHealthImpact
      })
    }

    // Физическое здоровье от работы
    if (job.physicalHealthImpact !== undefined && job.physicalHealthImpact !== 0) {
      modifiers.health.push({
        source: `Работа: ${job.title}`,
        health: job.physicalHealthImpact
      })
    }
  })


  // Модификаторы от активных курсов
  player.personal.activeCourses?.forEach(course => {
    if (course.energyCostPerTurn) {
      modifiers.energy.push({
        source: `Курс: ${course.courseName}`,
        energy: -course.energyCostPerTurn
      })
    }
    // Обучение даёт интеллект
    modifiers.intelligence.push({
      source: `Курс: ${course.courseName}`,
      intelligence: 1
    })
  })

  // Модификаторы от университета
  player.personal.activeUniversity?.forEach(uni => {
    if (uni.energyCostPerTurn) {
      modifiers.energy.push({
        source: `Университет: ${uni.programName}`,
        energy: -uni.energyCostPerTurn
      })
    }
    // Университет даёт больше интеллекта
    modifiers.intelligence.push({
      source: `Университет: ${uni.programName}`,
      intelligence: 2
    })
    // Но может снижать рассудок из-за стресса
    modifiers.sanity.push({
      source: `Университет: ${uni.programName}`,
      sanity: -1
    })
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

  // Модификаторы от бизнеса
  player.businesses?.forEach(business => {
    // Энергия от бизнеса
    if (business.energyCostPerTurn) {
      modifiers.energy.push({
        source: `Бизнес: ${business.name}`,
        energy: -business.energyCostPerTurn
      })
    }

    // Стресс от бизнеса влияет на рассудок
    if (business.stressImpact) {
      modifiers.sanity.push({
        source: `Бизнес: ${business.name}`,
        sanity: -business.stressImpact
      })
    }
  })

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
