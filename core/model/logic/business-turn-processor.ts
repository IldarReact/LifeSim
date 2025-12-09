import type { Business, BusinessEvent } from '@/core/types/business.types';
import type { Skill, SkillLevel, Notification } from '@/core/types';
import type { CountryEconomy } from '@/core/types/economy.types';
import {
  updateAutoAssignedRoles,
  calculatePlayerRoleEffects,
  getPlayerRoleSkillGrowth
} from '@/features/business/lib/player-roles';
import { generateBusinessEvents, updateBusinessMetrics, calculateBusinessFinancials } from '@/core/lib/business-utils';

/**
 * Результат обработки бизнесов за квартал
 */
export interface BusinessTurnResult {
  updatedBusinesses: Business[];
  updatedSkills: Skill[];
  totalIncome: number;
  totalExpenses: number;
  playerRoleEnergyCost: number;
  playerRoleSanityCost: number;
  notifications: Notification[];
  protectedSkills: Set<string>;
}

/**
 * Обработать все бизнесы игрока за квартал
 */
export function processBusinessTurn(
  businesses: Business[],
  playerSkills: Skill[],
  currentTurn: number,
  currentYear: number,
  globalMarketValue: number = 1.0,  // ✅ НОВОЕ: глобальное состояние рынка
  economy?: CountryEconomy  // ✅ НОВОЕ: экономика для инфляции
): BusinessTurnResult {
  const updatedBusinesses: Business[] = [];
  let updatedSkills = [...playerSkills];
  let totalIncome = 0;
  let totalExpenses = 0;
  let playerRoleEnergyCost = 0;
  let playerRoleSanityCost = 0;
  const notifications: Notification[] = [];
  const protectedSkills = new Set<string>();

  businesses.forEach(biz => {
    let updatedBiz = { ...biz };

    // 1. Opening Phase
    if (updatedBiz.state === 'opening') {
      updatedBiz.openingProgress.quartersLeft -= 1;
      if (updatedBiz.openingProgress.quartersLeft <= 0) {
        updatedBiz.state = 'active';
        notifications.push({
          id: `biz_open_${Date.now()}_${updatedBiz.id}`,
          type: 'success',
          title: 'Бизнес открыт! 🎉',
          message: `Ваш бизнес "${updatedBiz.name}" начал работу!`,
          date: `${currentYear} Q${(currentTurn % 4) || 4}`,
          isRead: false
        });
      }
      updatedBusinesses.push(updatedBiz);
      return;
    }

    // 2. Frozen State
    if (updatedBiz.state === 'frozen') {
      // Only fixed expenses
      const fixedExpenses = updatedBiz.quarterlyExpenses;
      totalExpenses += fixedExpenses;
      updatedBusinesses.push(updatedBiz);
      return;
    }

    // 3. Player Roles - автоматическое обновление и расчет эффектов
    updatedBiz = updateAutoAssignedRoles(updatedBiz);

    // Рассчитать эффекты ролей игрока на его статы
    const roleEffects = calculatePlayerRoleEffects(updatedBiz);
    playerRoleEnergyCost += Math.abs(roleEffects.energy || 0);
    playerRoleSanityCost += Math.abs(roleEffects.sanity || 0);

    // Получить информацию о росте навыков
    const skillGrowthInfo = getPlayerRoleSkillGrowth(updatedBiz);

    // Применить рост навыков к игроку
    skillGrowthInfo.forEach(({ skillName, progress }) => {
      const skillIdx = updatedSkills.findIndex(s => s.name === skillName);

      if (skillIdx === -1) {
        // Создать новый навык
        const newLevel = Math.min(5, Math.floor(progress / 100)) as SkillLevel;
        if (newLevel > 0) {
          updatedSkills.push({
            id: `skill_${Date.now()}_${Math.random()}`,
            name: skillName,
            level: newLevel,
            progress: progress % 100,
            lastPracticedTurn: currentTurn,
            isBeingStudied: false
          });
        }
      } else {
        // Обновить существующий навык
        const skill = { ...updatedSkills[skillIdx] };
        skill.progress += progress;
        skill.lastPracticedTurn = currentTurn;

        // Повышение уровня
        while (skill.progress >= 100 && skill.level < 5) {
          skill.level = (skill.level + 1) as SkillLevel;
          skill.progress -= 100;

          notifications.push({
            id: `biz_skill_${Date.now()}_${Math.random()}`,
            type: 'success',
            title: 'Профессиональный рост',
            message: `Благодаря работе в бизнесе "${updatedBiz.name}" ваш навык ${skill.name} повысился до уровня ${skill.level}!`,
            date: `${currentYear} Q${(currentTurn % 4) || 4}`,
            isRead: false
          });
        }

        updatedSkills[skillIdx] = skill;
      }

      // Защитить навык от деградации
      protectedSkills.add(skillName);
    });

    // 4. Events
    const events = generateBusinessEvents(updatedBiz, currentTurn);
    if (events.length > 0) {
      updatedBiz.eventsHistory = [...updatedBiz.eventsHistory, ...events];

      // Notify about events
      events.forEach(evt => {
        notifications.push({
          id: evt.id,
          type: evt.type === 'positive' ? 'success' : 'info',
          title: `Бизнес: ${evt.title}`,
          message: `${updatedBiz.name}: ${evt.description}`,
          date: `${currentYear} Q${(currentTurn % 4) || 4}`,
          isRead: false
        });
      });
    }

    // 5. Update Metrics (Efficiency, Reputation) - includes event impact
    updatedBiz = updateBusinessMetrics(updatedBiz, playerSkills);

    // 6. Financials & Inventory
    const financials = calculateBusinessFinancials(updatedBiz, false, playerSkills, globalMarketValue, economy);

    // Add event money effects
    const eventMoney = events.reduce((sum, e) => sum + (e.effects.money || 0), 0);

    // Adjust financials with event money
    if (eventMoney > 0) financials.income += eventMoney;
    else financials.expenses += Math.abs(eventMoney);

    totalIncome += financials.income;
    totalExpenses += financials.expenses;

    // 7. Update employee experience (+3 months per quarter)
    updatedBiz.employees = updatedBiz.employees.map(emp => ({
      ...emp,
      experience: emp.experience + 3
    }));

    // Update Business with new state
    updatedBusinesses.push({
      ...updatedBiz,
      inventory: financials.newInventory,
      quarterlyIncome: financials.income,
      quarterlyExpenses: financials.expenses
    });
  });

  return {
    updatedBusinesses,
    updatedSkills,
    totalIncome,
    totalExpenses,
    playerRoleEnergyCost,
    playerRoleSanityCost,
    notifications,
    protectedSkills
  };
}
