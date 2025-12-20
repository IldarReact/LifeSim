import { getRandomNegativeEvent, getRandomPositiveEvent } from '@/core/lib/data-loaders/static-data-loader';
import type { Business, BusinessEvent } from "@/core/types/business.types";

/**
 * Генерирует случайные события для бизнеса
 */
export function generateBusinessEvents(business: Business, currentTurn: number): BusinessEvent[] {
  const state = business.state ?? 'active';
  if (state !== 'active') return [];

  const events: BusinessEvent[] = [];
  // 0-3 события за квартал
  const eventCount = Math.floor(Math.random() * 4);

  // Шанс негативного события выше, если эффективность или репутация низкие
  const negativeChance = 0.3 + (100 - business.efficiency) / 200 + (100 - business.reputation) / 200;

  for (let i = 0; i < eventCount; i++) {
    const isNegative = Math.random() < negativeChance;

    if (isNegative) {
      const evt = getRandomNegativeEvent();
      if (!evt) continue;

      // Рассчитываем динамические эффекты
      const moneyEffect = evt.effects.moneyPercentage
        ? Math.round((business.inventory?.currentStock || 0) * (business.inventory?.purchaseCost || 0) * evt.effects.moneyPercentage)
        : (evt.effects.money || 0);

      events.push({
        id: `evt_${Date.now()}_${Math.random()}`,
        type: 'negative',
        title: evt.title,
        description: evt.description,
        turn: currentTurn,
        effects: {
          efficiency: evt.effects.efficiency || 0,
          reputation: evt.effects.reputation || 0,
          money: moneyEffect
        }
      });
    } else {
      const evt = getRandomPositiveEvent();
      if (!evt) continue;

      events.push({
        id: `evt_${Date.now()}_${Math.random()}`,
        type: 'positive',
        title: evt.title,
        description: evt.description,
        turn: currentTurn,
        effects: {
          efficiency: evt.effects.efficiency || 0,
          reputation: evt.effects.reputation || 0,
          money: evt.effects.money || 0
        }
      });
    }
  }

  return events;
}
