import type { Business } from '../../../types/business.types'
import type { CountryEconomy } from '../../../types/economy.types'
import { getQuarterlyInflatedSalary } from '../../calculations/price-helpers'
import { BUSINESS_BALANCE } from '../../data-loaders/business-balance-loader'
import { calculateEmployeeKPI } from '../employee-calculations'

export interface OpExResult {
  totalOpEx: number
  reducedEmployeesCost: number
  reducedRent: number
  reducedUtilities: number
  reducedInsurance: number
  minFixedCosts: number
}

export function calculateOpEx(
  business: Business,
  economy: CountryEconomy | undefined,
  expenseReductionPct: number,
): OpExResult {
  const { staffing } = BUSINESS_BALANCE

  // 1. Employee Costs
  let baseEmployeesCost = (business.employees || []).reduce((sum, emp) => {
    const salary = typeof emp.salary === 'number' ? emp.salary : 0
    const quarterlySalary = !isNaN(salary) ? salary : 0
    const experience =
      typeof emp.experience === 'number' && !isNaN(emp.experience) ? emp.experience : 0

    const indexedSalary = economy
      ? getQuarterlyInflatedSalary(quarterlySalary, economy, experience)
      : quarterlySalary

    const effort = typeof emp.effortPercent === 'number' ? emp.effortPercent : 100
    const effortFactor = (isNaN(effort) ? 100 : effort) / 100
    const scaledSalary = indexedSalary * effortFactor
    const quarterlyKpi = calculateEmployeeKPI({ ...emp, salary: scaledSalary })

    return sum + (scaledSalary + (isNaN(quarterlyKpi) ? 0 : quarterlyKpi))
  }, 0)

  // Add player salary
  if (business.playerEmployment) {
    const pSalary =
      typeof business.playerEmployment.salary === 'number' ? business.playerEmployment.salary : 0
    const quarterlySalary = !isNaN(pSalary) ? pSalary : 0
    const pExp =
      typeof business.playerEmployment.experience === 'number'
        ? business.playerEmployment.experience
        : 0
    const experience = !isNaN(pExp) ? pExp : 0

    const indexedSalary = economy
      ? getQuarterlyInflatedSalary(quarterlySalary, economy, experience)
      : quarterlySalary

    const pEffort =
      typeof business.playerEmployment.effortPercent === 'number'
        ? business.playerEmployment.effortPercent
        : 100
    const effortFactor = (isNaN(pEffort) ? 100 : pEffort) / 100
    const scaledSalary = indexedSalary * effortFactor

    const pProd =
      typeof business.playerEmployment.productivity === 'number'
        ? business.playerEmployment.productivity
        : 100
    const playerKpi = calculateEmployeeKPI({
      salary: scaledSalary,
      productivity: isNaN(pProd) ? 100 : pProd,
    })

    baseEmployeesCost += scaledSalary + (isNaN(playerKpi) ? 0 : playerKpi)
  }

  baseEmployeesCost = isNaN(baseEmployeesCost) ? 0 : baseEmployeesCost
  const payrollTaxes = baseEmployeesCost * (staffing.payrollTaxRate / 100)
  const employeesCost = baseEmployeesCost + payrollTaxes

  // 2. Fixed Costs
  const rent = staffing.baseRentPerEmployee * business.maxEmployees
  const utilities = staffing.baseUtilitiesPerEmployee * business.maxEmployees
  const insurance = business.hasInsurance ? business.insuranceCost || 0 : 0
  const MIN_FIXED_COSTS = staffing.minFixedCosts

  // 3. Reductions
  const reductionFactor = expenseReductionPct > 0 ? Math.max(0, 1 - expenseReductionPct / 100) : 1

  const reducedEmployeesCost = Math.round(
    (isNaN(employeesCost) ? 0 : employeesCost) * reductionFactor,
  )
  const reducedRent = Math.round((isNaN(rent) ? 0 : rent) * reductionFactor)
  const reducedUtilities = Math.round((isNaN(utilities) ? 0 : utilities) * reductionFactor)
  const reducedInsurance = Math.round((isNaN(insurance) ? 0 : insurance) * reductionFactor)
  const reducedMinFixedCosts = Math.round(MIN_FIXED_COSTS * reductionFactor)

  const totalOpEx =
    reducedEmployeesCost + reducedRent + reducedUtilities + reducedInsurance + reducedMinFixedCosts

  return {
    totalOpEx,
    reducedEmployeesCost,
    reducedRent,
    reducedUtilities,
    reducedInsurance,
    minFixedCosts: reducedMinFixedCosts,
  }
}
