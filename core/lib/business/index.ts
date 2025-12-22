/**
 * Business utilities - модульная структура
 *
 * Этот модуль объединяет все утилиты для работы с бизнесом:
 * - Валидация (Layer 3)
 * - Создание бизнеса (Layer 3)
 * - Генерация сотрудников
 * - Расчеты KPI и зарплат
 * - Метрики бизнеса (эффективность, репутация)
 * - Финансовые расчеты
 * - События
 * - Голосование партнеров
 */

// ====== Layer 3: Validation ======
export {
  validateBusinessOpening,
  validateEmployeeHire,
  validateBusinessUnfreeze,
  type BusinessOpeningValidation,
  type EmployeeHireValidation,
  type BusinessUnfreezeValidation,
} from './validate-business-opening'

// ====== Layer 3: Object Creation ======
export {
  createBusinessObject,
  createBusinessBranch,
  type CreateBusinessParams,
} from './create-business'

// ====== Layer 3: Employee Management ======
export {
  generateSkills,
  calculateSalary,
  generateEmployeeCandidate,
  generateCandidates,
  createEmployeeFromCandidate,
  createEmployeeObject,
} from './employee-generator'

export { calculateEmployeeKPI } from './employee-calculations'

// ====== Layer 3: Business Metrics & Financials ======
export { calculateEfficiency, calculateReputation, updateBusinessMetrics } from './business-metrics'

// Business financials
export {
  calculateBusinessFinancials,
  calculateBusinessIncome,
  updateInventory,
} from './business-financials'

// Business events
export { generateBusinessEvents } from './business-events'

// NPC voting
export { calculateNPCVote } from './npc-voting'

// Player roles
export {
  playerHasRole,
  getPlayerActiveRoles,
  calculatePlayerRoleEffects,
  getPlayerRoleSkillGrowth,
  getPlayerRoleBusinessImpact,
  canPlayerTakeRole,
  isRoleFilled,
  getTotalEmployeesCount,
  checkMinimumStaffing,
  getAutoAssignedManagerialRoles,
  updateAutoAssignedRoles,
} from './player-roles'

export {
  getRoleConfig,
  isManagerialRole,
  isOperationalRole,
  getManagerialRoles,
  getOperationalRoles,
  EMPLOYEE_ROLES_CONFIG,
} from './employee-roles.config'
