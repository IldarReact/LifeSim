import type { EconomicEvent, EconomicEventType, CountryEconomy } from '@/core/types';

/**
 * Генерирует случайное экономическое событие
 * @param turn - Текущий ход
 * @param currentEconomy - Текущее состояние экономики
 * @returns Экономическое событие или null
 */
export function generateEconomicEvent(
  turn: number,
  currentEconomy: CountryEconomy
): EconomicEvent | null {
  // Вероятность события: 10% каждый квартал
  if (Math.random() > 0.1) {
    return null;
  }

  const eventType = selectEventType(currentEconomy);
  return createEvent(eventType, turn);
}

/**
 * Выбирает тип события на основе текущей экономической ситуации
 */
function selectEventType(economy: CountryEconomy): EconomicEventType {
  const { inflation, gdpGrowth, unemployment } = economy;

  // Высокая инфляция → вероятнее повышение ставки
  if (inflation > 8) {
    return Math.random() > 0.3 ? 'rate_hike' : 'crisis';
  }

  // Низкий рост ВВП → вероятнее рецессия или снижение ставки
  if (gdpGrowth < 1) {
    return Math.random() > 0.5 ? 'recession' : 'rate_cut';
  }

  // Высокая безработица → кризис или рецессия
  if (unemployment > 10) {
    return Math.random() > 0.5 ? 'crisis' : 'recession';
  }

  // Хорошая экономика → бум или стабильность
  if (gdpGrowth > 4 && inflation < 5) {
    return 'boom';
  }

  // Случайное событие
  const events: EconomicEventType[] = [
    'crisis',
    'boom',
    'recession',
    'inflation_spike',
    'rate_hike',
    'rate_cut'
  ];

  return events[Math.floor(Math.random() * events.length)];
}

/**
 * Создает конкретное событие
 */
function createEvent(type: EconomicEventType, turn: number): EconomicEvent {
  const events: Record<EconomicEventType, Omit<EconomicEvent, 'id' | 'turn'>> = {
    crisis: {
      type: 'crisis',
      title: 'Экономический кризис',
      description: 'Мировой финансовый кризис затронул экономику. Инфляция растет, ключевая ставка повышается, безработица увеличивается.',
      duration: 8, // 2 года
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
      description: 'Экономика переживает период быстрого роста. ВВП растет, безработица снижается, зарплаты увеличиваются.',
      duration: 6, // 1.5 года
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
      description: 'Экономика замедляется. Рост ВВП снижается, безработица растет, но инфляция под контролем.',
      duration: 6, // 1.5 года
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
      duration: 4, // 1 год
      effects: {
        inflationChange: 4,
        keyRateChange: 2,
        gdpGrowthChange: -1,
        unemploymentChange: 1,
        salaryModifierChange: 1.05, // Зарплаты растут, но медленнее инфляции
      },
    },
    rate_hike: {
      type: 'rate_hike',
      title: 'Повышение ключевой ставки',
      description: 'Центральный банк повышает ключевую ставку для борьбы с инфляцией. Кредиты становятся дороже.',
      duration: 4, // 1 год
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
      description: 'Центральный банк снижает ключевую ставку для стимулирования экономики. Кредиты становятся дешевле.',
      duration: 4, // 1 год
      effects: {
        inflationChange: 1,
        keyRateChange: -2,
        gdpGrowthChange: 1.5,
        unemploymentChange: -1,
        salaryModifierChange: 1.05,
      },
    },
  };

  const eventData = events[type];

  return {
    id: `event_${turn}_${type}`,
    turn,
    ...eventData,
  };
}

/**
 * Применяет эффекты события к экономике
 */
export function applyEventEffects(
  economy: CountryEconomy,
  event: EconomicEvent
): CountryEconomy {
  const { effects } = event;

  return {
    ...economy,
    inflation: Math.max(0, economy.inflation + (effects.inflationChange || 0)),
    keyRate: Math.max(0, economy.keyRate + (effects.keyRateChange || 0)),
    gdpGrowth: economy.gdpGrowth + (effects.gdpGrowthChange || 0),
    unemployment: Math.max(0, Math.min(100, economy.unemployment + (effects.unemploymentChange || 0))),
    salaryModifier: economy.salaryModifier * (effects.salaryModifierChange || 1),
  };
}

/**
 * Обновляет активные события (уменьшает duration)
 */
export function updateActiveEvents(events: EconomicEvent[]): EconomicEvent[] {
  return events
    .map(event => ({
      ...event,
      duration: event.duration - 1,
    }))
    .filter(event => event.duration > 0);
}

/**
 * Применяет естественные изменения экономики (без событий)
 */
export function applyNaturalEconomicChanges(economy: CountryEconomy): CountryEconomy {
  // Инфляция стремится к целевому уровню (4%)
  const targetInflation = 4;
  const inflationDelta = (targetInflation - economy.inflation) * 0.1;

  // Ключевая ставка корректируется в зависимости от инфляции
  const keyRateDelta = (economy.inflation - targetInflation) * 0.2;

  // ВВП колеблется случайно
  const gdpDelta = (Math.random() - 0.5) * 0.5;

  return {
    ...economy,
    inflation: Math.max(0, economy.inflation + inflationDelta),
    keyRate: Math.max(0, economy.keyRate + keyRateDelta),
    gdpGrowth: economy.gdpGrowth + gdpDelta,
  };
}

/**
 * Рассчитывает зарплату с учетом инфляции и модификатора
 */
export function calculateAdjustedSalary(
  baseSalary: number,
  economy: CountryEconomy,
  quartersPassed: number = 0
): number {
  // Применяем инфляцию (квартальную)
  const quarterlyInflation = economy.inflation / 4 / 100;
  const inflationMultiplier = Math.pow(1 + quarterlyInflation, quartersPassed);

  // Применяем модификатор зарплат
  return Math.round(baseSalary * inflationMultiplier * economy.salaryModifier);
}
