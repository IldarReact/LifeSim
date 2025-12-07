import type { Business } from "@/core/types/business.types";
import type { Skill } from '@/core/types';
import { checkMinimumStaffing, getPlayerRoleBusinessImpact } from '@/features/business/lib/player-roles';

/**
 * Рассчитывает эффективность бизнеса (0-100)
 */
export function calculateEfficiency(business: Business, playerSkills?: Skill[]): number {
  const state = business.state ?? 'active';
  if (state !== 'active') return 0;

  // 1. Проверка минимального персонала
  const staffingCheck = checkMinimumStaffing(business);
  if (!staffingCheck.isValid) {
    console.log(`[Business ${business.name}] Staffing requirements not met. Efficiency: 0`);
    return 0; // Бизнес не работает без минимума
  }

  // 2. Базовая эффективность от сотрудников
  let totalEfficiency = 0;
  let managerBonus = 0;

  business.employees.forEach(emp => {
    // Вклад сотрудника зависит от его эффективности и продуктивности
    const contribution = emp.skills.efficiency * (emp.productivity / 100);

    // Менеджеры дают бонус к общей эффективности
    if (emp.role === 'manager') {
      managerBonus += (emp.skills.management / 100) * 10; // До +10% от каждого менеджера
    }

    totalEfficiency += contribution;
  });

  // Средняя эффективность команды
  let avgEfficiency = totalEfficiency / business.employees.length;

  // 3. Бонус менеджера
  avgEfficiency += managerBonus;

  // 4. ✅ НОВОЕ: Влияние навыков игрока
  let playerBonus = 0;
  if (playerSkills && playerSkills.length > 0) {
    const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills);
    playerBonus = playerImpact.efficiencyBonus;
    avgEfficiency += playerBonus;
  }

  // 5. Влияние событий (последние 4 события)
  const recentEvents = (business.eventsHistory || []).slice(-4);
  const eventImpact = recentEvents.reduce((sum, event) => sum + (event.effects.efficiency || 0), 0);

  // Итоговая эффективность
  const finalEfficiency = Math.min(100, Math.max(0, avgEfficiency + eventImpact));

  console.log(`[Business ${business.name}] Efficiency Calc: Avg=${avgEfficiency.toFixed(1)}, ManagerBonus=${managerBonus.toFixed(1)}, PlayerBonus=${playerBonus.toFixed(1)}, EventImpact=${eventImpact}, Final=${finalEfficiency.toFixed(1)}`);

  return Math.round(finalEfficiency);
}

/**
 * Рассчитывает репутацию бизнеса (0-100)
 */
export function calculateReputation(business: Business, currentEfficiency: number, playerSkills?: Skill[]): number {
  // Репутация меняется медленно, стремясь к текущей эффективности
  // Но также зависит от маркетинга и событий

  // 1. Влияние эффективности (вес 60%)
  const efficiencyImpact = currentEfficiency * 0.6;

  // 2. Влияние команды (звезды) (вес 20%)
  const avgStars = business.employees.length > 0
    ? business.employees.reduce((sum, e) => sum + e.stars, 0) / business.employees.length
    : 0;
  const teamImpact = (avgStars / 5) * 100 * 0.2; // 5 звезд = 100 * 0.2 = 20

  // 3. Маркетологи (вес 20%)
  const marketers = business.employees.filter(e => e.role === 'marketer');
  const marketingImpact = marketers.length > 0
    ? (marketers.reduce((sum, m) => sum + m.skills.creativity, 0) / marketers.length) * 0.2
    : 0;

  // 4. ✅ НОВОЕ: Влияние навыков игрока на репутацию
  let playerReputationBonus = 0;
  if (playerSkills && playerSkills.length > 0) {
    const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills);
    playerReputationBonus = playerImpact.reputationBonus;
  }

  // 5. События (прямое влияние)
  const recentEvents = (business.eventsHistory || []).slice(-4);
  const eventImpact = recentEvents.reduce((sum, event) => sum + (event.effects.reputation || 0), 0);

  // Целевая репутация
  const targetReputation = efficiencyImpact + teamImpact + marketingImpact + playerReputationBonus + eventImpact;

  // Плавное изменение (сдвиг на 10% к цели каждый ход)
  const newReputation = business.reputation + (targetReputation - business.reputation) * 0.1;

  console.log(`[Business ${business.name}] Reputation Calc: Target=${targetReputation.toFixed(1)}, PlayerBonus=${playerReputationBonus.toFixed(1)}, Current=${business.reputation.toFixed(1)}, New=${newReputation.toFixed(1)}`);

  return Math.min(100, Math.max(0, Math.round(newReputation)));
}

/**
 * Обновляет метрики бизнеса (эффективность, репутация)
 */
export function updateBusinessMetrics(business: Business, playerSkills?: Skill[]): Business {
  const efficiency = calculateEfficiency(business, playerSkills);
  const reputation = calculateReputation(business, efficiency, playerSkills);

  return {
    ...business,
    efficiency,
    reputation
  };
}
