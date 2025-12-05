/**
 * Business utilities - модульная структура
 * 
 * Этот модуль объединяет все утилиты для работы с бизнесом:
 * - Генерация сотрудников
 * - Расчеты KPI и зарплат
 * - Метрики бизнеса (эффективность, репутация)
 * - Финансовые расчеты
 * - События
 * - Голосование партнеров
 */

// Employee management
export {
  generateSkills,
  calculateSalary,
  generateEmployeeCandidate,
  generateCandidates
} from './employee-generator';

export {
  calculateEmployeeKPI
} from './employee-calculations';

// Business metrics
export {
  calculateEfficiency,
  calculateReputation,
  updateBusinessMetrics
} from './business-metrics';

// Business financials
export {
  calculateBusinessFinancials,
  calculateBusinessIncome,
  updateInventory
} from './business-financials';

// Business events
export {
  generateBusinessEvents
} from './business-events';

// NPC voting
export {
  calculateNPCVote
} from './npc-voting';
