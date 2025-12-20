import type { Business, EmployeeRole } from '@/core/types/business.types';
import type { Skill } from '@/core/types';
import type { StatEffect } from '@/core/types/stats.types';
import { getRoleConfig, isManagerialRole, isOperationalRole } from './employee-roles.config';

/**
 * Информация о росте навыка
 */
export interface SkillGrowthInfo {
  skillName: string;
  progress: number;
}

/**
 * Влияние игрока на бизнес
 */
export interface PlayerBusinessImpact {
  efficiencyBonus: number;
  expenseReduction: number;
  salesBonus: number;
  reputationBonus: number;
}

/**
 * Проверить, выполняет ли игрок указанную роль в бизнесе
 */
export function playerHasRole(business: Business, role: EmployeeRole): boolean {
  const { managerialRoles, operationalRole } = business.playerRoles;

  if (isManagerialRole(role)) {
    return managerialRoles.includes(role);
  }

  if (isOperationalRole(role)) {
    return operationalRole === role;
  }

  return false;
}

/**
 * Получить все активные роли игрока в бизнесе
 */
export function getPlayerActiveRoles(business: Business): EmployeeRole[] {
  const { managerialRoles, operationalRole } = business.playerRoles;
  const roles = [...managerialRoles];

  if (operationalRole) {
    roles.push(operationalRole as EmployeeRole);
  }

  return roles;
}

/**
 * Рассчитать эффекты всех ролей игрока на его статы
 */
export function calculatePlayerRoleEffects(business: Business): StatEffect {
  const activeRoles = getPlayerActiveRoles(business);

  const totalEffect: StatEffect = {
    energy: 0,
    sanity: 0,
  };

  activeRoles.forEach(role => {
    const config = getRoleConfig(role);
    if (config) {
      const effects = config.playerEffects;
      totalEffect.energy = (totalEffect.energy || 0) + (effects.energy || 0);
      totalEffect.sanity = (totalEffect.sanity || 0) + (effects.sanity || 0);
      totalEffect.happiness = (totalEffect.happiness || 0) + (effects.happiness || 0);
      totalEffect.health = (totalEffect.health || 0) + (effects.health || 0);
      totalEffect.intelligence = (totalEffect.intelligence || 0) + (effects.intelligence || 0);
    }
  });

  return totalEffect;
}

/**
 * Получить информацию о росте навыков игрока за работу в ролях
 */
export function getPlayerRoleSkillGrowth(business: Business): SkillGrowthInfo[] {
  const activeRoles = getPlayerActiveRoles(business);
  const skillGrowth: SkillGrowthInfo[] = [];

  activeRoles.forEach(role => {
    const config = getRoleConfig(role);
    if (config?.skillGrowth) {
      skillGrowth.push({
        skillName: config.skillGrowth.name,
        progress: config.skillGrowth.progressPerQuarter,
      });
    }
  });

  return skillGrowth;
}

/**
 * Рассчитать влияние навыков игрока на бизнес
 */
export function getPlayerRoleBusinessImpact(
  business: Business,
  playerSkills: Skill[]
): PlayerBusinessImpact {
  const activeRoles = getPlayerActiveRoles(business);

  const impact: PlayerBusinessImpact = {
    efficiencyBonus: 0,
    expenseReduction: 0,
    salesBonus: 0,
    reputationBonus: 0,
  };

  activeRoles.forEach(role => {
    const config = getRoleConfig(role);
    if (!config?.businessImpact) return;

    // Найти соответствующий навык игрока
    const skillName = config.skillGrowth?.name;
    const playerSkill = skillName
      ? playerSkills.find(s => s.name === skillName) || null
      : null;

    const roleImpact = config.businessImpact;

    if (roleImpact.efficiencyBonus) {
      impact.efficiencyBonus += roleImpact.efficiencyBonus(playerSkill);
    }

    if (roleImpact.expenseReduction) {
      impact.expenseReduction += roleImpact.expenseReduction(playerSkill);
    }

    if (roleImpact.salesBonus) {
      impact.salesBonus += roleImpact.salesBonus(playerSkill);
    }

    if (roleImpact.reputationBonus) {
      impact.reputationBonus += roleImpact.reputationBonus(playerSkill);
    }
  });

  return impact;
}

/**
 * Проверить, может ли игрок взять указанную роль
 * (для операционных ролей можно проверять наличие навыков)
 */
export function canPlayerTakeRole(
  role: EmployeeRole,
  playerSkills: Skill[]
): boolean {
  const config = getRoleConfig(role);
  if (!config) return false;

  // Управленческие роли может взять любой
  if (config.type === 'managerial') {
    return true;
  }

  // Операционные роли - желательно иметь навык, но не обязательно
  // Игрок может работать и без навыка, но с низкой эффективностью
  return true;
}

/**
 * Проверить, закрыта ли роль в бизнесе (есть сотрудник или игрок)
 */
export function isRoleFilled(business: Business, role: EmployeeRole): boolean {
  // Проверить, есть ли сотрудник на этой роли
  const hasEmployee = business.employees.some(e => e.role === role);

  // Проверить, выполняет ли игрок эту роль
  const playerHas = playerHasRole(business, role);

  return hasEmployee || playerHas;
}

/**
 * Проверить, выполнены ли минимальные требования к персоналу
 */
export function checkMinimumStaffing(business: Business): {
  isValid: boolean;
  missingRoles: EmployeeRole[];
  totalEmployees: number;
  requiredEmployees: number;
  workerCount: number;
  requiredWorkers: number;
} {
  const requiredRoles = business.requiredRoles || [];
  const minEmployees = business.minEmployees || 0;

  // Проверить обязательные роли
  const missingRoles: EmployeeRole[] = [];

  requiredRoles.forEach(role => {
    if (!isRoleFilled(business, role)) {
      missingRoles.push(role);
    }
  });

  // Подсчитать общее количество "сотрудников" (включая игрока в операционной роли)
  let totalEmployees = business.employees.length;
  if (business.playerRoles.operationalRole) {
    totalEmployees += 1;  // Игрок в операционной роли считается как сотрудник
  }

  // Подсчитать только работников (worker)
  let workerCount = business.employees.filter(e => e.role === 'worker').length;

  // Если игрок выполняет роль worker, учитываем его
  if (business.playerRoles.operationalRole === 'worker') {
    workerCount += 1;
  }

  // Проверка: выполнены обязательные роли И достаточно работников
  const isValid = missingRoles.length === 0 && workerCount >= minEmployees;

  return {
    isValid,
    missingRoles,
    totalEmployees,
    requiredEmployees: minEmployees,
    workerCount,
    requiredWorkers: minEmployees,
  };
}

/**
 * Получить список ролей, которые игрок должен выполнять автоматически
 * (если нет сотрудников на этих ролях)
 */
export function getAutoAssignedManagerialRoles(business: Business): EmployeeRole[] {
  const autoRoles: EmployeeRole[] = [];

  // Управляющий и Бухгалтер - обязательные роли по умолчанию
  const defaultRoles: EmployeeRole[] = ['manager', 'accountant'];

  defaultRoles.forEach(role => {
    const hasEmployee = business.employees.some(e => e.role === role);
    if (!hasEmployee) {
      autoRoles.push(role as EmployeeRole);
    }
  });

  return autoRoles;
}

/**
 * Обновить роли игрока автоматически
 * (добавить обязательные роли, если нет сотрудников)
 */
export function updateAutoAssignedRoles(business: Business): Business {
  const autoRoles = getAutoAssignedManagerialRoles(business);

  // Объединить автоматические роли с уже выбранными
  const currentRoles = business.playerRoles.managerialRoles;
  const allRoles = Array.from(new Set([...currentRoles, ...autoRoles])) as EmployeeRole[];

  return {
    ...business,
    playerRoles: {
      ...business.playerRoles,
      managerialRoles: allRoles,
    },
  };
}
