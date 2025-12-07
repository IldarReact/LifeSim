import type { ThresholdEffectsResult } from './types'

export function checkSanityEffects(sanity: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    canManageBusiness: true,
    therapyCosts: 0,
    events: [],
    businessEfficiency: 1.0,
  }

  if (sanity < 10) {
    result.canManageBusiness = false
    result.therapyCosts = 1000
    result.events!.push({
      type: 'sanity',
      severity: 'critical',
      message: 'ПАНИКА! Вы теряете контроль. Управление бизнесом невозможно.',
    })
    result.businessEfficiency = 0.3
  } else if (sanity < 20) {
    result.therapyCosts = 500
    result.events!.push({
      type: 'sanity',
      severity: 'critical',
      message: 'Вы на грани срыва. Высокий риск ошибок и конфликтов!',
    })
    result.businessEfficiency = 0.6
  } else if (sanity < 30) {
    result.events!.push({
      type: 'sanity',
      severity: 'warning',
      message: 'Повышенная тревожность. Рекомендуется отдых или помощь психолога.',
    })
    result.businessEfficiency = 0.8
  }

  return result
}
