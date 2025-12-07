import type { ThresholdEffectsResult } from './types'

export function checkIntelligenceEffects(intelligence: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    canStudy: true,
    events: [],
    learningEfficiency: 1.0,
  }

  if (intelligence < 10) {
    result.canStudy = false
    result.events!.push({
      type: 'intelligence',
      severity: 'critical',
      message: 'Критическая деградация! Вы почти не способны думать. Обучение невозможно.',
    })
    result.learningEfficiency = 0
  } else if (intelligence < 20) {
    result.events!.push({
      type: 'intelligence',
      severity: 'critical',
      message: 'Сложно принимать решения. Высокий риск ошибок в бизнесе.',
    })
    result.learningEfficiency = 0.4
  } else if (intelligence < 30) {
    result.events!.push({
      type: 'intelligence',
      severity: 'warning',
      message: 'Вы теряете навыки. Необходимо обучение и развитие.',
    })
    result.learningEfficiency = 0.7
  }

  return result
}
