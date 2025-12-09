import type { EmployeeRole } from "@/core/types"
import type { CountryEconomy } from "@/core/types/economy.types"
import type { AvailablePosition } from "../types"
import { ROLE_DESCRIPTIONS } from "../constants"
import { getInflatedBaseSalary } from "@/core/lib/calculations/price-helpers"

export function getAvailablePositions(economy: CountryEconomy | undefined): AvailablePosition[] {
  if (!economy || !economy.baseSalaries) return []

  const roles: EmployeeRole[] = ['manager', 'salesperson', 'worker', 'accountant']
  
  return roles.map(role => {
    const baseSalary = economy.baseSalaries![role] || 3000
    const inflatedSalary = getInflatedBaseSalary(baseSalary, economy)
    const finalSalary = Math.round(inflatedSalary * economy.salaryModifier)
    
    if (role === 'manager') {
      console.log('💼 Salary calc:', {
        role,
        baseSalary,
        inflatedSalary,
        modifier: economy.salaryModifier,
        finalSalary,
        inflationHistory: economy.inflationHistory
      })
    }
    
    return {
      role,
      salary: finalSalary,
      description: ROLE_DESCRIPTIONS[role]
    }
  })
}


