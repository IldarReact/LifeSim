import type { StateCreator } from 'zustand'
import type { GameStore, BusinessSlice } from './types'
import type { Business, Employee, EmployeeCandidate, BusinessType } from '@/core/types'
import { updateBusinessMetrics, calculateBusinessIncome } from '@/core/lib/business-utils'

export const createBusinessSlice: StateCreator<
  GameStore,
  [],
  [],
  BusinessSlice
> = (set, get) => ({
  openBusiness: (
    name: string,
    type: BusinessType,
    description: string,
    initialCost: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    maxEmployees: number,
    energyCostPerTurn: number,
    stressImpact: number
  ) => {
    const state = get()
    if (!state.player) return

    // Проверяем, хватает ли денег
    if (state.player.cash < initialCost) {
      console.warn('Недостаточно денег для открытия бизнеса')
      return
    }

    console.log('Creating business with:', {
      monthlyIncome,
      monthlyExpenses,
      quarterlyIncome: (monthlyIncome || 0) * 3,
      quarterlyExpenses: (monthlyExpenses || 0) * 3
    })

    const newBusiness: Business = {
      id: `business_${Date.now()}`,
      name,
      type,
      description,
      initialCost,
      quarterlyIncome: (monthlyIncome || 0) * 3, // Convert input monthly to quarterly for storage
      quarterlyExpenses: (monthlyExpenses || 0) * 3, // Convert input monthly to quarterly for storage
      currentValue: initialCost,
      employees: [],
      maxEmployees,
      reputation: 50,
      efficiency: 50,
      customerSatisfaction: 50,
      energyCostPerTurn: energyCostPerTurn || 0,
      stressImpact: stressImpact || 0,
      foundedTurn: state.turn
    }

    set({
      player: {
        ...state.player,
        cash: state.player.cash - initialCost,
        businesses: [...state.player.businesses, newBusiness]
      }
    })
  },

  hireEmployee: (businessId: string, candidate: EmployeeCandidate) => {
    const state = get()
    if (!state.player) return

    const businessIndex = state.player.businesses.findIndex(b => b.id === businessId)
    if (businessIndex === -1) return

    const business = state.player.businesses[businessIndex]

    // Проверяем лимит сотрудников
    if (business.employees.length >= business.maxEmployees) {
      console.warn('Достигнут лимит сотрудников')
      return
    }

    // Проверяем бюджет (на первую зарплату)
    if (state.player.cash < candidate.requestedSalary) {
      console.warn('Недостаточно денег для найма')
      return
    }

    // Создаем сотрудника из кандидата
    const newEmployee: Employee = {
      id: `employee_${Date.now()}`,
      name: candidate.name,
      role: candidate.role,
      level: candidate.level,
      skills: candidate.skills,
      salary: candidate.requestedSalary,
      satisfaction: 80, // Начальная удовлетворенность
      productivity: 75, // Начальная продуктивность
      experience: candidate.experience
    }

    // Обновляем список сотрудников
    const employees = [...business.employees, newEmployee]
    
    // Пересчитываем метрики бизнеса
    const tempBusiness = { ...business, employees }
    const updatedMetrics = updateBusinessMetrics(tempBusiness)
    
    // Мы не обновляем monthlyIncome/expenses в самом объекте бизнеса здесь, 
    // так как они являются "базовыми" значениями. 
    // Динамические значения (с учетом сотрудников) должны рассчитываться в UI или в отдельном поле.
    // Но для простоты, давайте пока оставим базовые значения неизменными, 
    // а реальный доход будет считаться в turn-logic.
    
    // Однако, UI (BusinessManagement) показывает business.monthlyIncome.
    // Если мы хотим чтобы UI показывал реальный доход, нам нужно или обновлять это поле,
    // или добавить поле calculatedIncome.
    // Давайте пока просто обновим метрики.

    const updatedBusinesses = [...state.player.businesses]
    updatedBusinesses[businessIndex] = {
      ...updatedMetrics,
      employees
    }

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses
      }
    })
  },

  fireEmployee: (businessId: string, employeeId: string) => {
    const state = get()
    if (!state.player) return

    const businessIndex = state.player.businesses.findIndex(b => b.id === businessId)
    if (businessIndex === -1) return

    const business = state.player.businesses[businessIndex]
    const employees = business.employees.filter(e => e.id !== employeeId)

    // Пересчитываем метрики
    const tempBusiness = { ...business, employees }
    const updatedMetrics = updateBusinessMetrics(tempBusiness)

    const updatedBusinesses = [...state.player.businesses]
    updatedBusinesses[businessIndex] = {
      ...updatedMetrics,
      employees
    }

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses
      }
    })
  },

  closeBusiness: (businessId: string) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find(b => b.id === businessId)
    if (!business) return

    // Возвращаем часть стоимости бизнеса (50%)
    const returnValue = Math.round(business.currentValue * 0.5)

    set({
      player: {
        ...state.player,
        cash: state.player.cash + returnValue,
        businesses: state.player.businesses.filter(b => b.id !== businessId)
      }
    })
  }
})
