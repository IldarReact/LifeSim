import type { EconomicEvent, EconomicEventType } from '@/core/types'

export const ECONOMIC_EVENT_DEFINITIONS: Record<
  EconomicEventType,
  Omit<EconomicEvent, 'id' | 'turn'>
> = {
  crisis: {
    type: 'crisis',
    title: 'Экономический кризис',
    description:
      'Мировой финансовый кризис затронул экономику. Инфляция растет, ключевая ставка повышается, безработица увеличивается.',
    duration: 8,
    effects: {
      inflationChange: 5,
      keyRateChange: 3,
      gdpGrowthChange: -4,
      unemploymentChange: 3,
      salaryModifierChange: 0.9,
    },
  },
  boom: {
    type: 'boom',
    title: 'Экономический бум',
    description:
      'Экономика переживает период быстрого роста. ВВП растет, безработица снижается, зарплаты увеличиваются.',
    duration: 6,
    effects: {
      inflationChange: 1,
      keyRateChange: -0.5,
      gdpGrowthChange: 3,
      unemploymentChange: -2,
      salaryModifierChange: 1.15,
    },
  },
  recession: {
    type: 'recession',
    title: 'Рецессия',
    description:
      'Экономика замедляется. Рост ВВП снижается, безработица растет, но инфляция под контролем.',
    duration: 6,
    effects: {
      inflationChange: -1,
      keyRateChange: -1,
      gdpGrowthChange: -2,
      unemploymentChange: 2,
      salaryModifierChange: 0.95,
    },
  },
  inflation_spike: {
    type: 'inflation_spike',
    title: 'Скачок инфляции',
    description: 'Резкий рост цен на товары и услуги. Центральный банк вынужден повышать ставку.',
    duration: 4,
    effects: {
      inflationChange: 4,
      keyRateChange: 2,
      gdpGrowthChange: -1,
      unemploymentChange: 1,
      salaryModifierChange: 1.05,
    },
  },
  rate_hike: {
    type: 'rate_hike',
    title: 'Повышение ключевой ставки',
    description:
      'Центральный банк повышает ключевую ставку для борьбы с инфляцией. Кредиты становятся дороже.',
    duration: 4,
    effects: {
      inflationChange: -2,
      keyRateChange: 2.5,
      gdpGrowthChange: -0.5,
      unemploymentChange: 0.5,
      salaryModifierChange: 1.0,
    },
  },
  rate_cut: {
    type: 'rate_cut',
    title: 'Снижение ключевой ставки',
    description:
      'Центральный банк снижает ключевую ставку для стимулирования экономики. Кредиты становятся дешевле.',
    duration: 4,
    effects: {
      inflationChange: 1,
      keyRateChange: -2,
      gdpGrowthChange: 1.5,
      unemploymentChange: -1,
      salaryModifierChange: 1.05,
    },
  },
}

export function createEconomicEvent(type: EconomicEventType, turn: number): EconomicEvent {
  const def = ECONOMIC_EVENT_DEFINITIONS[type]
  return {
    id: `event_${turn}_${type}`,
    turn,
    ...def,
  }
}
