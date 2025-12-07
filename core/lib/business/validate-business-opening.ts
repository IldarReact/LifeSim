/**
 * Layer 3: Business Opening Validation
 *
 * ✅ Pure function — no side effects
 * ✅ Typed inputs and outputs
 * ✅ Single responsibility: validate business opening parameters
 */

import type { PlayerState } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

export interface BusinessOpeningValidation {
  isValid: boolean
  error?: string
  details: {
    hasEnoughMoney: boolean
    hasEnoughEnergy: boolean
  }
}

/**
 * Validates if player can open a business with given costs
 *
 * @param playerMoney - Current player money
 * @param upfrontCost - Required upfront cost
 * @param creationCost - Energy/stat costs
 * @returns Validation result with details
 *
 * @example
 * validateBusinessOpening(50000, 30000, { energy: -10 })
 * // { isValid: true, details: { hasEnoughMoney: true, hasEnoughEnergy: true } }
 */
export function validateBusinessOpening(
  playerMoney: number,
  upfrontCost: number,
  playerEnergy: number,
  creationCost: StatEffect,
): BusinessOpeningValidation {
  const hasEnoughMoney = playerMoney >= upfrontCost
  const hasEnoughEnergy = !creationCost.energy || playerEnergy >= Math.abs(creationCost.energy)

  return {
    isValid: hasEnoughMoney && hasEnoughEnergy,
    error: !hasEnoughMoney
      ? 'Недостаточно денег для открытия бизнеса'
      : !hasEnoughEnergy
        ? 'Недостаточно энергии для открытия бизнеса'
        : undefined,
    details: {
      hasEnoughMoney,
      hasEnoughEnergy,
    },
  }
}

/**
 * Validates if player can hire an employee
 *
 * @param playerMoney - Current player money
 * @param employeeRequiredSalary - Employee salary requirement
 * @param currentEmployeeCount - Current employees in business
 * @param maxEmployees - Maximum allowed employees
 * @returns Validation result with details
 */
export interface EmployeeHireValidation {
  isValid: boolean
  error?: string
  details: {
    hasEnoughMoney: boolean
    hasCapacity: boolean
  }
}

export function validateEmployeeHire(
  playerMoney: number,
  employeeRequiredSalary: number,
  currentEmployeeCount: number,
  maxEmployees: number,
): EmployeeHireValidation {
  const hasEnoughMoney = playerMoney >= employeeRequiredSalary
  const hasCapacity = currentEmployeeCount < maxEmployees

  return {
    isValid: hasEnoughMoney && hasCapacity,
    error: !hasEnoughMoney
      ? 'Недостаточно денег для найма'
      : !hasCapacity
        ? 'Достигнут лимит сотрудников'
        : undefined,
    details: {
      hasEnoughMoney,
      hasCapacity,
    },
  }
}

/**
 * Validates if business can be unfrozen
 *
 * @param playerMoney - Current player money
 * @param businessInitialCost - Business initial cost (unfreeze cost is 30% of this)
 * @returns Validation result
 */
export interface BusinessUnfreezeValidation {
  isValid: boolean
  error?: string
  unfreezeCost: number
}

export function validateBusinessUnfreeze(
  playerMoney: number,
  businessInitialCost: number,
): BusinessUnfreezeValidation {
  const unfreezeCost = Math.round(businessInitialCost * 0.3)
  const hasEnoughMoney = playerMoney >= unfreezeCost

  return {
    isValid: hasEnoughMoney,
    error: !hasEnoughMoney
      ? `Недостаточно денег для разморозки бизнеса (требуется ${unfreezeCost})`
      : undefined,
    unfreezeCost,
  }
}
