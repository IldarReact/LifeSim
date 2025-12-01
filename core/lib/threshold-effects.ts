import type { PersonalStats } from '@/core/types/stats.types'
import type { Notification } from '@/core/types/notification.types'

/**
 * Результат проверки пороговых эффектов
 */
export interface ThresholdEffectsResult {
  // Блокировки действий
  canWork: boolean
  canStudy: boolean
  canManageBusiness: boolean

  // Дополнительные расходы
  medicalCosts: number
  therapyCosts: number

  // События для генерации
  events: Array<{
    type: 'health' | 'sanity' | 'intelligence' | 'happiness'
    severity: 'warning' | 'critical'
    message: string
  }>

  // Модификаторы эффективности
  workEfficiency: number      // 0.0 - 1.0
  businessEfficiency: number  // 0.0 - 1.0
  learningEfficiency: number  // 0.0 - 1.0
}

/**
 * Проверяет пороговые эффекты для здоровья
 */
function checkHealthEffects(health: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    canWork: true,
    medicalCosts: 0,
    events: [],
    workEfficiency: 1.0
  }

  if (health < 10) {
    // КРИТИЧЕСКОЕ состояние
    result.canWork = false
    result.medicalCosts = 2000 // Госпитализация
    result.events!.push({
      type: 'health',
      severity: 'critical',
      message: 'Тяжелая болезнь! Вы госпитализированы. Работа и бизнес приостановлены.'
    })
    result.workEfficiency = 0
  } else if (health < 20) {
    // Серьезные проблемы
    result.medicalCosts = 500 // Лечение
    result.events!.push({
      type: 'health',
      severity: 'warning',
      message: 'Плохое самочувствие. Необходимо лечение. Эффективность снижена.'
    })
    result.workEfficiency = 0.5
  } else if (health < 30) {
    // Предупреждение
    result.events!.push({
      type: 'health',
      severity: 'warning',
      message: 'Здоровье ухудшается. Обратите внимание на отдых и питание.'
    })
    result.workEfficiency = 0.8
  }

  return result
}

/**
 * Проверяет пороговые эффекты для рассудка
 */
function checkSanityEffects(sanity: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    canManageBusiness: true,
    therapyCosts: 0,
    events: [],
    businessEfficiency: 1.0
  }

  if (sanity < 10) {
    // ПАНИКА
    result.canManageBusiness = false
    result.therapyCosts = 1000 // Экстренная помощь
    result.events!.push({
      type: 'sanity',
      severity: 'critical',
      message: 'ПАНИКА! Вы теряете контроль. Управление бизнесом невозможно.'
    })
    result.businessEfficiency = 0.3
  } else if (sanity < 20) {
    // На грани срыва
    result.therapyCosts = 500 // Психолог
    result.events!.push({
      type: 'sanity',
      severity: 'critical',
      message: 'Вы на грани срыва. Высокий риск ошибок и конфликтов!'
    })
    result.businessEfficiency = 0.6
  } else if (sanity < 30) {
    // Повышенная тревожность
    result.events!.push({
      type: 'sanity',
      severity: 'warning',
      message: 'Повышенная тревожность. Рекомендуется отдых или помощь психолога.'
    })
    result.businessEfficiency = 0.8
  }

  return result
}

/**
 * Проверяет пороговые эффекты для интеллекта
 */
function checkIntelligenceEffects(intelligence: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    canStudy: true,
    events: [],
    learningEfficiency: 1.0
  }

  if (intelligence < 10) {
    // Критическая деградация
    result.canStudy = false
    result.events!.push({
      type: 'intelligence',
      severity: 'critical',
      message: 'Критическая деградация! Вы почти не способны думать. Обучение невозможно.'
    })
    result.learningEfficiency = 0
  } else if (intelligence < 20) {
    // Сложно думать
    result.events!.push({
      type: 'intelligence',
      severity: 'critical',
      message: 'Сложно принимать решения. Высокий риск ошибок в бизнесе.'
    })
    result.learningEfficiency = 0.4
  } else if (intelligence < 30) {
    // Потеря навыков
    result.events!.push({
      type: 'intelligence',
      severity: 'warning',
      message: 'Вы теряете навыки. Необходимо обучение и развитие.'
    })
    result.learningEfficiency = 0.7
  }

  return result
}

/**
 * Проверяет пороговые эффекты для счастья
 */
function checkHappinessEffects(happiness: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    events: [],
    workEfficiency: 1.0
  }

  if (happiness < 10) {
    // Глубокая депрессия
    result.events!.push({
      type: 'happiness',
      severity: 'critical',
      message: 'Глубокая депрессия. Вы не видите смысла в жизни. Все кажется бессмысленным.'
    })
    result.workEfficiency = 0.4
  } else if (happiness < 20) {
    // Эмоциональное истощение
    result.events!.push({
      type: 'happiness',
      severity: 'critical',
      message: 'Эмоциональное истощение. Жизнь теряет краски. Необходим отдых!'
    })
    result.workEfficiency = 0.6
  } else if (happiness < 30) {
    // Несчастье
    result.events!.push({
      type: 'happiness',
      severity: 'warning',
      message: 'Вы чувствуете себя несчастным. Найдите время для хобби и близких.'
    })
    result.workEfficiency = 0.8
  }

  return result
}

/**
 * Объединяет все пороговые эффекты
 */
export function checkAllThresholdEffects(stats: PersonalStats): ThresholdEffectsResult {
  const healthEffects = checkHealthEffects(stats.health)
  const sanityEffects = checkSanityEffects(stats.sanity)
  const intelligenceEffects = checkIntelligenceEffects(stats.intelligence)
  const happinessEffects = checkHappinessEffects(stats.happiness)

  // Объединяем результаты
  return {
    canWork: healthEffects.canWork ?? true,
    canStudy: intelligenceEffects.canStudy ?? true,
    canManageBusiness: sanityEffects.canManageBusiness ?? true,

    medicalCosts: healthEffects.medicalCosts ?? 0,
    therapyCosts: sanityEffects.therapyCosts ?? 0,

    events: [
      ...(healthEffects.events ?? []),
      ...(sanityEffects.events ?? []),
      ...(intelligenceEffects.events ?? []),
      ...(happinessEffects.events ?? [])
    ],

    // Берем минимальную эффективность
    workEfficiency: Math.min(
      healthEffects.workEfficiency ?? 1.0,
      happinessEffects.workEfficiency ?? 1.0
    ),
    businessEfficiency: sanityEffects.businessEfficiency ?? 1.0,
    learningEfficiency: intelligenceEffects.learningEfficiency ?? 1.0
  }
}

/**
 * Генерирует события для низких статов (случайные негативные события)
 */
export function generateLowStatEvents(
  stats: PersonalStats,
  turn: number,
  year: number
): Notification[] {
  const notifications: Notification[] = []
  const quarter = (turn % 4) || 4

  // Конфликт на работе (Sanity < 20)
  if (stats.sanity < 20 && Math.random() < 0.3) {
    notifications.push({
      id: `conflict_work_${Date.now()}`,
      type: 'warning',
      title: '⚠️ Конфликт на работе',
      message: 'Из-за стресса вы поссорились с коллегой. Это может повлиять на вашу карьеру.',
      date: `${year} Q${quarter}`,
      isRead: false
    })
  }

  // Ошибка в бизнесе (Sanity < 20)
  if (stats.sanity < 20 && Math.random() < 0.2) {
    notifications.push({
      id: `business_error_${Date.now()}`,
      type: 'warning',
      title: '📉 Ошибка в бизнесе',
      message: 'Из-за стресса вы приняли неверное решение. Репутация бизнеса пострадала.',
      date: `${year} Q${quarter}`,
      isRead: false,
      data: { reputationLoss: 10 }
    })
  }

  // Семейный конфликт (Sanity < 20 или Happiness < 20)
  if ((stats.sanity < 20 || stats.happiness < 20) && Math.random() < 0.15) {
    notifications.push({
      id: `family_conflict_${Date.now()}`,
      type: 'warning',
      title: '💔 Семейный конфликт',
      message: 'Ваше состояние привело к ссоре с близкими. Отношения ухудшились.',
      date: `${year} Q${quarter}`,
      isRead: false,
      data: { relationshipLoss: 10 }
    })
  }

  return notifications
}
