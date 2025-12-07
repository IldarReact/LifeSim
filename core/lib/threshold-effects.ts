import type { StatEffect } from '@/core/types/stats.types'
import type { Notification } from '@/core/types/notification.types'

import { checkHealthEffects } from './threshold-effects/health'
import { checkSanityEffects } from './threshold-effects/sanity'
import { checkIntelligenceEffects } from './threshold-effects/intelligence'
import { checkHappinessEffects } from './threshold-effects/happiness'
export type { ThresholdEffectsResult } from './threshold-effects/types'

export function checkAllThresholdEffects(stats: StatEffect) {
  const healthEffects = checkHealthEffects(stats.health || 0)
  const sanityEffects = checkSanityEffects(stats.sanity || 0)
  const intelligenceEffects = checkIntelligenceEffects(stats.intelligence || 0)
  const happinessEffects = checkHappinessEffects(stats.happiness || 0)

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
      ...(happinessEffects.events ?? []),
    ],

    workEfficiency: Math.min(
      healthEffects.workEfficiency ?? 1.0,
      happinessEffects.workEfficiency ?? 1.0,
    ),
    businessEfficiency: sanityEffects.businessEfficiency ?? 1.0,
    learningEfficiency: intelligenceEffects.learningEfficiency ?? 1.0,
  }
}

export function generateLowStatEvents(
  stats: StatEffect,
  turn: number,
  year: number,
): Notification[] {
  const notifications: Notification[] = []
  const quarter = turn % 4 || 4

  if ((stats.sanity || 0) < 20 && Math.random() < 0.3) {
    notifications.push({
      id: `conflict_work_${Date.now()}`,
      type: 'warning',
      title: '⚠️ Конфликт на работе',
      message: 'Из-за стресса вы поссорились с коллегой. Это может повлиять на вашу карьеру.',
      date: `${year} Q${quarter}`,
      isRead: false,
    })
  }

  if ((stats.sanity || 0) < 20 && Math.random() < 0.2) {
    notifications.push({
      id: `business_error_${Date.now()}`,
      type: 'warning',
      title: '📉 Ошибка в бизнесе',
      message: 'Из-за стресса вы приняли неверное решение. Репутация бизнеса пострадала.',
      date: `${year} Q${quarter}`,
      isRead: false,
      data: { reputationLoss: 10 },
    })
  }

  if (((stats.sanity || 0) < 20 || (stats.happiness || 0) < 20) && Math.random() < 0.15) {
    notifications.push({
      id: `family_conflict_${Date.now()}`,
      type: 'warning',
      title: '💔 Семейный конфликт',
      message: 'Ваше состояние привело к ссоре с близкими. Отношения ухудшились.',
      date: `${year} Q${quarter}`,
      isRead: false,
      data: { relationshipLoss: 10 },
    })
  }

  return notifications
}
