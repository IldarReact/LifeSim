import type { Business, EmployeeRole } from '../../../types/business.types'
import type { Skill } from '../../../types/skill.types'
import { getRoleConfig } from '../employee-roles.config'

import { isRoleFilled, getTotalEmployeesCount } from './role-utils'

/**
 * Проверить, может ли игрок взять указанную роль
 * (для операционных ролей можно проверять наличие навыков)
 */
export function canPlayerTakeRole(role: EmployeeRole, playerSkills: Skill[]): boolean {
  const config = getRoleConfig(role)
  if (!config) return false

  // Управленческие роли может взять любой
  if (config.type === 'managerial') {
    return true
  }

  // Операционные роли - желательно иметь навык, но не обязательно
  // Игрок может работать и без навыка, но с низкой эффективностью
  return true
}

/**
 * Проверить, выполнены ли минимальные требования к персоналу
 */
export function checkMinimumStaffing(business: Business): {
  isValid: boolean
  missingRoles: EmployeeRole[]
  totalEmployees: number
  requiredEmployees: number
  workerCount: number
  requiredWorkers: number
} {
  // Базовые обязательные роли (для маленьких бизнесов только менеджер)
  const globalRequiredRoles: EmployeeRole[] =
    business.maxEmployees > 15 ? ['manager', 'accountant'] : ['manager']
  const specificRequiredRoles = business.employeeRoles
    .filter((r) => r.priority === 'required')
    .map((r) => r.role)
  const allRequiredRoles = Array.from(
    new Set([...globalRequiredRoles, ...specificRequiredRoles]),
  ) as EmployeeRole[]

  const minEmployees = business.minEmployees || 0

  // Проверить обязательные роли
  const missingRoles: EmployeeRole[] = []

  allRequiredRoles.forEach((role) => {
    if (!isRoleFilled(business, role)) {
      missingRoles.push(role)
    }
  })

  // Подсчитать общее количество "сотрудников"
  const totalEmployees = getTotalEmployeesCount(business)

  // Подсчитать только работников (worker)
  let workerCount = business.employees.filter((e) => e.role === 'worker').length

  // Если игрок выполняет роль worker, учитываем его
  if (business.playerRoles.operationalRole === 'worker') {
    workerCount += 1
  }

  // Проверка: выполнены обязательные роли И достаточно работников
  const isValid = missingRoles.length === 0 && workerCount >= minEmployees

  return {
    isValid,
    missingRoles,
    totalEmployees,
    requiredEmployees: minEmployees,
    workerCount,
    requiredWorkers: minEmployees,
  }
}

/**
 * Получить список ролей, которые игрок должен выполнять автоматически
 * (если нет сотрудников на этих ролях)
 */
export function getAutoAssignedManagerialRoles(business: Business): EmployeeRole[] {
  // Теперь роли не назначаются автоматически. Игрок должен выбрать слот вручную.
  return []
}

/**
 * Обновить роли игрока автоматически
 * (УДАЛЕНО: теперь игрок должен назначать себя сам)
 */
export function updateAutoAssignedRoles(business: Business): Business {
  // Теперь роли не назначаются автоматически. Игрок должен выбрать слот вручную.
  return business
}
