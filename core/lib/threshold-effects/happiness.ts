import type { ThresholdEffectsResult } from './types'

export function checkHappinessEffects(happiness: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    events: [],
    workEfficiency: 1.0,
  }

  if (happiness < 10) {
    result.events!.push({
      type: 'happiness',
      severity: 'critical',
      message: 'Глубокая депрессия. Вы не видите смысла в жизни. Все кажется бессмысленным.',
    })
    result.workEfficiency = 0.4
  } else if (happiness < 20) {
    result.events!.push({
      type: 'happiness',
      severity: 'critical',
      message: 'Эмоциональное истощение. Жизнь теряет краски. Необходим отдых!',
    })
    result.workEfficiency = 0.6
  } else if (happiness < 30) {
    result.events!.push({
      type: 'happiness',
      severity: 'warning',
      message: 'Вы чувствуете себя несчастным. Найдите время для хобби и близких.',
    })
    result.workEfficiency = 0.8
  }

  return result
}
