import { getRandomNegativeEvent, getRandomPositiveEvent } from '@/core/lib/data-loaders/static-data-loader'
import type { Business, BusinessEvent } from '@/core/types/business.types'
import { getRoleConfig } from './employee-roles.config'

/**
 * Генерирует случайные события для бизнеса
 */
export function generateBusinessEvents(business: Business, currentTurn: number): BusinessEvent[] {
  const state = business.state ?? 'active'
  if (state !== 'active') return []

  // Считаем бонус защиты от юристов
  let legalProtectionPct = 0
  business.employees.forEach((emp) => {
    const cfg = getRoleConfig(emp.role)
    const impact = cfg?.staffImpact ? cfg.staffImpact(emp.stars) : undefined
    if (impact?.legalProtection) {
      const effortFactor = (emp.effortPercent ?? 100) / 100
      legalProtectionPct += impact.legalProtection * effortFactor
    }
  })

  const events: BusinessEvent[] = []
  // 0-3 события за квартал
  const eventCount = Math.floor(Math.random() * 4)

  // Шанс негативного события выше, если эффективность или репутация низкие
  let negativeChance = 0.3 + (100 - business.efficiency) / 200 + (100 - business.reputation) / 200

  // Применяем юридическую защиту (снижаем шанс в % от текущего шанса)
  if (legalProtectionPct > 0) {
    const protectionFactor = Math.max(0, 1 - legalProtectionPct / 100)
    negativeChance *= protectionFactor
  }

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
