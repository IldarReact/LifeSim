import type { Skill } from '@/core/types';
import type { StatEffect } from '@/core/types/stats.types';

/**
 * Тип роли: управленческая или операционная
 * - managerial: можно выполнять несколько одновременно (частично)
 * - operational: только одна роль, полный рабочий день
 */
export type RoleType = 'managerial' | 'operational';

/**
 * Влияние роли на бизнес
 */
export interface BusinessImpact {
  efficiencyBonus?: (skill: Skill | null) => number;
  expenseReduction?: (skill: Skill | null) => number;
  salesBonus?: (skill: Skill | null) => number;
  reputationBonus?: (skill: Skill | null) => number;
}

/**
 * Конфигурация роли сотрудника
 */
export interface EmployeeRoleConfig {
  type: RoleType;
  name: string;
  description: string;

  // Эффекты на игрока, если он выполняет эту роль
  playerEffects: StatEffect;

  // Рост навыка при работе в роли
  skillGrowth: {
    name: string;
    progressPerQuarter: number;
  } | null;

  // Влияние навыка игрока на бизнес (если он работает в этой роли)
  businessImpact?: BusinessImpact;
}

/**
 * Конфигурация всех ролей сотрудников
 */
export const EMPLOYEE_ROLES_CONFIG: Record<string, EmployeeRoleConfig> = {
  // ============================================
  // УПРАВЛЕНЧЕСКИЕ РОЛИ (можно несколько сразу)
  // ============================================

  manager: {
    type: 'managerial',
    name: 'Управляющий',
    description: 'Организует процессы, мотивирует команду, принимает стратегические решения',

    playerEffects: {
      energy: -10,
      sanity: -1,
    },

    skillGrowth: {
      name: 'Менеджмент',
      progressPerQuarter: 20,
    },

    businessImpact: {
      efficiencyBonus: (skill) => skill ? skill.level * 5 : 0,  // +5% за уровень
    },
  },

  accountant: {
    type: 'managerial',
    name: 'Бухгалтер',
    description: 'Контролирует финансы, оптимизирует налоги, снижает расходы',

    playerEffects: {
      energy: -8,
      sanity: -1,
    },

    skillGrowth: {
      name: 'Бухгалтерия',
      progressPerQuarter: 20,
    },

    businessImpact: {
      expenseReduction: (skill) => skill ? skill.level * 3 : 0,  // -3% расходов за уровень
    },
  },

  marketer: {
    type: 'managerial',
    name: 'Маркетолог',
    description: 'Повышает узнаваемость бренда, привлекает клиентов',

    playerEffects: {
      energy: -12,
      sanity: -1,
    },

    skillGrowth: {
      name: 'Маркетинг',
      progressPerQuarter: 20,
    },

    businessImpact: {
      reputationBonus: (skill) => skill ? skill.level * 2 : 0,  // +2 репутации за уровень
      salesBonus: (skill) => skill ? skill.level * 3 : 0,  // +3% продаж за уровень
    },
  },

  lawyer: {
    type: 'managerial',
    name: 'Юрист',
    description: 'Решает юридические вопросы, защищает от штрафов и проверок',

    playerEffects: {
      energy: -10,
      sanity: -2,
    },

    skillGrowth: {
      name: 'Юриспруденция',
      progressPerQuarter: 15,
    },

    businessImpact: {
      // Юрист снижает шанс негативных событий (реализуется отдельно)
    },
  },

  hr: {
    type: 'managerial',
    name: 'HR-менеджер',
    description: 'Управляет персоналом, повышает удовлетворенность сотрудников',

    playerEffects: {
      energy: -9,
      sanity: -1,
    },

    skillGrowth: {
      name: 'Управление персоналом',
      progressPerQuarter: 18,
    },

    businessImpact: {
      // HR повышает productivity сотрудников (реализуется отдельно)
    },
  },

  // ============================================
  // ОПЕРАЦИОННЫЕ РОЛИ (только одна, полный день)
  // ============================================

  salesperson: {
    type: 'operational',
    name: 'Продавец',
    description: 'Работает с клиентами, увеличивает продажи',

    playerEffects: {
      energy: -15,
      sanity: -2,
    },

    skillGrowth: {
      name: 'Продажи',
      progressPerQuarter: 20,
    },

    businessImpact: {
      salesBonus: (skill) => skill ? skill.level * 10 : 5,  // +10% за уровень, минимум +5%
    },
  },

  technician: {
    type: 'operational',
    name: 'Техник',
    description: 'Обслуживает оборудование, повышает качество продукции',

    playerEffects: {
      energy: -16,
      sanity: -1,
    },

    skillGrowth: {
      name: 'Инженерия',
      progressPerQuarter: 20,
    },

    businessImpact: {
      efficiencyBonus: (skill) => skill ? skill.level * 8 : 5,  // +8% за уровень
    },
  },

  worker: {
    type: 'operational',
    name: 'Работник',
    description: 'Выполняет основную работу, производит товары/услуги',

    playerEffects: {
      energy: -18,
      sanity: -2,
    },

    skillGrowth: null,  // Работник не дает роста навыков

    businessImpact: {
      efficiencyBonus: () => 5,  // Фиксированный бонус +5%
    },
  },
};

/**
 * Получить конфиг роли
 */
export function getRoleConfig(role: string): EmployeeRoleConfig | undefined {
  return EMPLOYEE_ROLES_CONFIG[role];
}

/**
 * Проверить, является ли роль управленческой
 */
export function isManagerialRole(role: string): boolean {
  const config = getRoleConfig(role);
  return config?.type === 'managerial';
}

/**
 * Проверить, является ли роль операционной
 */
export function isOperationalRole(role: string): boolean {
  const config = getRoleConfig(role);
  return config?.type === 'operational';
}

/**
 * Получить список всех управленческих ролей
 */
export function getManagerialRoles(): string[] {
  return Object.keys(EMPLOYEE_ROLES_CONFIG).filter(isManagerialRole);
}

/**
 * Получить список всех операционных ролей
 */
export function getOperationalRoles(): string[] {
  return Object.keys(EMPLOYEE_ROLES_CONFIG).filter(isOperationalRole);
}
