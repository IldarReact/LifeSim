import type { Business, EmployeeRole } from '../../../types/business.types'
import { isManagerialRole, isOperationalRole } from '../employee-roles.config'

/**
 * Проверить, выполняет ли игрок указанную роль в бизнесе
 */
export function playerHasRole(business: Business, role: EmployeeRole): boolean {
  const { managerialRoles, operationalRole } = business.playerRoles

  if (isManagerialRole(role)) {
    return managerialRoles.includes(role)
  }

  if (isOperationalRole(role)) {
    return operationalRole === role
  }

  return false
}

/**
 * Получить все активные роли игрока в бизнесе
 */
export function getPlayerActiveRoles(business: Business): EmployeeRole[] {
  const { managerialRoles, operationalRole } = business.playerRoles
  const roles = [...managerialRoles]

  if (operationalRole) {
    roles.push(operationalRole as EmployeeRole)
  }

  return roles
}

/**
 * Проверить, закрыта ли роль в бизнесе (есть сотрудник или игрок)
 */
export function isRoleFilled(business: Business, role: EmployeeRole): boolean {
  // Проверить, есть ли сотрудник на этой роли
  const hasEmployee = business.employees.some((e) => e.role === role)

  // Проверить, выполняет ли игрок эту роль
  const playerHas = playerHasRole(business, role)

  return hasEmployee || playerHas
}

/**
 * Получить эффективный лимит сотрудников (с учетом расширения 5x)
 */
export function getEffectiveMaxEmployees(business: Business): number {
  return (business.maxEmployees || 0) * 5
}

/**
 * Подсчитать общее количество "сотрудников" (включая игрока во всех ролях)
 */
export function getTotalEmployeesCount(business: Business): number {
  const playerRolesCount =
    (business.playerRoles.managerialRoles?.length || 0) +
    (business.playerRoles.operationalRole ? 1 : 0)
  return business.employees.length + playerRolesCount
}
