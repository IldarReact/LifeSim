import { getQuarterlyInflatedSalary } from '@/core/lib/calculations/price-helpers'
import type { Employee } from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'

export function calculateEmployeeSalary(
  employee: Employee,
  economy: CountryEconomy | undefined
): number {
  if (!economy) return employee.salary
  return getQuarterlyInflatedSalary(employee.salary, economy, employee.experience)
}
