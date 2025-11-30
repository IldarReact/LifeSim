import type { MarketEvent } from '@/core/types'

/**
 * Генератор событий глобального рынка
 */

interface MarketEventTemplate {
  title: string
  description: string
  impact: number
  duration: number
  type: 'positive' | 'negative' | 'neutral'
  probability: number // 0.0 - 1.0
}

const MARKET_EVENT_TEMPLATES: MarketEventTemplate[] = [
  // Позитивные события (рост рынка)
  {
    title: 'Экономический бум',
    description: 'Мировая экономика переживает период бурного роста. Спрос на товары и услуги значительно вырос.',
    impact: 0.5,
    duration: 4,
    type: 'positive',
    probability: 0.05
  },
  {
    title: 'Технологический прорыв',
    description: 'Новые технологии открывают новые возможности для бизнеса. Потребительский спрос растет.',
    impact: 0.3,
    duration: 6,
    type: 'positive',
    probability: 0.08
  },
  {
    title: 'Снижение налогов',
    description: 'Правительство снизило налоги для бизнеса. Покупательская способность населения выросла.',
    impact: 0.2,
    duration: 8,
    type: 'positive',
    probability: 0.1
  },
  {
    title: 'Рост потребительского доверия',
    description: 'Потребители стали более оптимистичны и активнее тратят деньги.',
    impact: 0.15,
    duration: 3,
    type: 'positive',
    probability: 0.15
  },

  // Негативные события (падение рынка)
  {
    title: 'Экономический кризис',
    description: 'Мировая экономика вошла в рецессию. Спрос на товары и услуги резко упал.',
    impact: -0.6,
    duration: 6,
    type: 'negative',
    probability: 0.03
  },
  {
    title: 'Финансовый коллапс',
    description: 'Крах фондового рынка вызвал панику среди инвесторов и потребителей.',
    impact: -0.8,
    duration: 8,
    type: 'negative',
    probability: 0.01
  },
  {
    title: 'Рост инфляции',
    description: 'Высокая инфляция снижает покупательскую способность населения.',
    impact: -0.3,
    duration: 5,
    type: 'negative',
    probability: 0.12
  },
  {
    title: 'Торговые войны',
    description: 'Международные торговые конфликты негативно влияют на мировую экономику.',
    impact: -0.25,
    duration: 4,
    type: 'negative',
    probability: 0.08
  },
  {
    title: 'Энергетический кризис',
    description: 'Резкий рост цен на энергоносители увеличивает издержки бизнеса.',
    impact: -0.2,
    duration: 3,
    type: 'negative',
    probability: 0.1
  },

  // Нейтральные/стабилизирующие события
  {
    title: 'Стабилизация рынка',
    description: 'Рынок постепенно возвращается к нормальным показателям.',
    impact: 0.1,
    duration: 2,
    type: 'neutral',
    probability: 0.2
  }
]

/**
 * Генерирует случайное событие рынка на основе вероятностей
 */
export function generateMarketEvent(currentTurn: number, currentYear: number): MarketEvent | null {
  // Генерируем событие с вероятностью 30% каждый квартал
  if (Math.random() > 0.3) {
    return null
  }

  // Выбираем событие на основе вероятностей
  const roll = Math.random()
  let cumulativeProbability = 0

  for (const template of MARKET_EVENT_TEMPLATES) {
    cumulativeProbability += template.probability
    if (roll <= cumulativeProbability) {
      return {
        id: `market_event_${currentTurn}_${Date.now()}`,
        title: template.title,
        description: template.description,
        impact: template.impact,
        duration: template.duration,
        turn: currentTurn,
        type: template.type,
        startTurn: currentTurn,
        endTurn: currentTurn + template.duration
      }
    }
  }

  return null
}

/**
 * Проверяет, истекли ли активные события рынка
 */
export function cleanupExpiredMarketEvents(
  events: MarketEvent[],
  currentTurn: number
): MarketEvent[] {
  return events.filter(event => {
    if (event.endTurn !== undefined) {
      return event.endTurn > currentTurn
    }
    // Fallback to turn + duration for old events
    return event.turn + event.duration > currentTurn
  })
}

/**
 * Рассчитывает суммарное влияние всех активных событий на рынок
 */
export function calculateTotalMarketImpact(events: MarketEvent[]): number {
  return events.reduce((total, event) => total + event.impact, 0)
}
