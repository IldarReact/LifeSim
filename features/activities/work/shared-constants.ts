import type { EmployeeRole } from "@/core/types"

// Employee roles
export const ROLE_LABELS: Record<EmployeeRole, string> = {
  manager: "Управляющий",
  salesperson: "Продавец",
  accountant: "Бухгалтер",
  marketer: "Маркетолог",
  technician: "Техник",
  worker: "Рабочий"
}

// Employee star ratings (1-5 stars)
export const STARS_LABELS: Record<number, string> = {
  1: "⭐",
  2: "⭐⭐",
  3: "⭐⭐⭐",
  4: "⭐⭐⭐⭐",
  5: "⭐⭐⭐⭐⭐"
}

export const STARS_COLORS: Record<number, string> = {
  1: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  2: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  3: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  4: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  5: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
}

// Salary configuration
export const SALARY_CONFIG = {
  MIN: 1000,
  MAX: 1_000_000,
  STEP: 1000,
  DEFAULT: 5000
} as const

// KPI configuration
export const KPI_CONFIG = {
  MIN: 0,
  MAX: 50,
  STEP: 5,
  DEFAULT: 0,
  THRESHOLD: 80
} as const

// Calculations
export const SKILL_STAR_DIVISOR = 20
export const MONTHS_PER_QUARTER = 3
export const MONTHS_PER_YEAR = 12
