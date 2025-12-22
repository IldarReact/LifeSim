import type { Employee } from "../../types/business.types";

/**
 * Рассчитывает KPI бонус/штраф для сотрудника
 */
export function calculateEmployeeKPI(employee: Employee): number {
  if (employee.productivity >= 80) return Math.round(employee.salary * 0.1);  // +10%
  if (employee.productivity <= 50) return Math.round(employee.salary * -0.1); // -10%
  return 0;
}
