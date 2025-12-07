import type { ThresholdEffectsResult } from './types'

export function checkHealthEffects(health: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    canWork: true,
    medicalCosts: 0,
    events: [],
    workEfficiency: 1.0,
  }

  if (health < 10) {
    result.canWork = false
    result.medicalCosts = 2000
    result.events!.push({
      type: 'health',
      severity: 'critical',
      message: 'Тяжелая болезнь! Вы госпитализированы. Работа и бизнес приостановлены.',
    })
    result.workEfficiency = 0
  } else if (health < 20) {
    result.medicalCosts = 500
    result.events!.push({
      type: 'health',
      severity: 'warning',
      message: 'Плохое самочувствие. Необходимо лечение. Эффективность снижена.',
    })
    result.workEfficiency = 0.5
  } else if (health < 30) {
    result.events!.push({
      type: 'health',
      severity: 'warning',
      message: 'Здоровье ухудшается. Обратите внимание на отдых и питание.',
    })
    result.workEfficiency = 0.8
  }

  return result
}
