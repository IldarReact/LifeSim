/**
 * Рассчитывает KPI бонус/штраф для сотрудника
 */
export function calculateEmployeeKPI(employee: { salary: number; productivity: number }): number {
  if (employee.productivity >= 80) return Math.round(employee.salary * 0.1) // +10%
  if (employee.productivity <= 50) return Math.round(employee.salary * -0.1) // -10%
  return 0
}
