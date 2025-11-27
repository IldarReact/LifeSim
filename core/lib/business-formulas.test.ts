import { describe, it, expect } from 'vitest'
import { calculateBusinessFinancials, updateBusinessMetrics } from './business-utils'
import type { Business, Employee } from '@/core/types'

describe('Business Formulas', () => {
  const mockBusiness: Business = {
    id: 'test-biz',
    name: 'Test Business',
    type: 'retail',
    description: 'Test',
    initialCost: 10000,
    quarterlyIncome: 5000,
    quarterlyExpenses: 2000,
    currentValue: 10000,
    employees: [],
    maxEmployees: 5,
    reputation: 50,
    efficiency: 50,
    customerSatisfaction: 50,
    energyCostPerTurn: 10,
    stressImpact: 5,
    foundedTurn: 1
  }

  const createMockEmployee = (role: Employee['role'], skills: Partial<Employee['skills']> = {}): Employee => ({
    id: 'emp-1',
    name: 'John Doe',
    role,
    level: 'middle',
    skills: {
      efficiency: 50,
      salesAbility: 50,
      technical: 50,
      management: 50,
      creativity: 50,
      ...skills
    },
    salary: 1000,
    satisfaction: 100,
    productivity: 100,
    experience: 4
  })

  describe('calculateBusinessFinancials', () => {
    it('should calculate base financials without employees', () => {
      const result = calculateBusinessFinancials(mockBusiness)
      expect(result.income).toBe(5000)
      expect(result.expenses).toBe(2000)
      expect(result.profit).toBe(3000)
    })

    it('should include employee salary in expenses', () => {
      const employee = createMockEmployee('worker')
      const businessWithEmployee = {
        ...mockBusiness,
        employees: [employee]
      }
      const result = calculateBusinessFinancials(businessWithEmployee)
      // Expenses: 2000 (base) + 1000 (salary) = 3000
      expect(result.expenses).toBe(3000)
    })

    it('should increase income with a salesperson', () => {
      const salesperson = createMockEmployee('salesperson', { salesAbility: 80 })
      // Salesperson adds: salesAbility * 10 * overallFactor
      // overallFactor = (100 + 100) / 2 / 100 = 1.0 (since prod/sat are 100)
      // Bonus = 80 * 10 * 1.0 = 800

      const businessWithSales = {
        ...mockBusiness,
        employees: [salesperson]
      }
      const result = calculateBusinessFinancials(businessWithSales)

      // Income: 5000 (base) + 800 (bonus) = 5800
      expect(result.income).toBe(5800)
    })

    it('should reduce expenses with an accountant', () => {
      const accountant = createMockEmployee('accountant', { efficiency: 80 })
      // Accountant multiplier: 1 - (efficiency/100 * 0.15 * overallFactor)
      // Multiplier = 1 - (0.8 * 0.15 * 1.0) = 1 - 0.12 = 0.88

      const businessWithAccountant = {
        ...mockBusiness,
        employees: [accountant]
      }
      const result = calculateBusinessFinancials(businessWithAccountant)

      // Expenses: (2000 + 1000 salary) * 0.88 = 3000 * 0.88 = 2640
      expect(result.expenses).toBe(2640)
    })

    it('should apply manager multiplier to income', () => {
      const manager = createMockEmployee('manager', { management: 100 })
      // Manager multiplier: 1 + (management/100 * 0.2 * overallFactor)
      // Multiplier = 1 + (1.0 * 0.2 * 1.0) = 1.2

      const businessWithManager = {
        ...mockBusiness,
        employees: [manager]
      }
      const result = calculateBusinessFinancials(businessWithManager)

      // Income: 5000 * 1.2 = 6000
      expect(result.income).toBe(6000)
    })
  })

  describe('updateBusinessMetrics', () => {
    it('should update efficiency based on employees', () => {
      const emp1 = createMockEmployee('worker', { efficiency: 80 })
      const emp2 = createMockEmployee('worker', { efficiency: 60 })

      const business = {
        ...mockBusiness,
        employees: [emp1, emp2]
      }

      const result = updateBusinessMetrics(business)
      // Avg efficiency: (80 + 60) / 2 = 70
      expect(result.efficiency).toBe(70)
    })

    it('should reset metrics if no employees', () => {
      const result = updateBusinessMetrics(mockBusiness)
      expect(result.efficiency).toBe(50)
      expect(result.reputation).toBe(50)
    })
  })
})
