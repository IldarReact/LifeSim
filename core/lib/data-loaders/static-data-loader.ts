import type { EmployeeRole, EmployeeStars } from '@/core/types/business.types'
import type { CountryEconomy } from '@/core/types/economy.types'
import type { IdeaTemplate } from '@/core/types/idea.types'
import businessEvents from '@/shared/data/business/business-events.json'
import ideaTemplates from '@/shared/data/business/idea-templates.json'
import employeeData from '@/shared/data/employees/employee-data.json'
import crisisOptions from '@/shared/data/events/crisis-options.json'
import countries from '@/shared/data/world/countries.json'
import countryArchetypes from '@/shared/data/world/country-archetypes.json'

// Types

// --- Employees Data ---
export const getEmployeeData = () => employeeData

export const getRoleDescription = (role: EmployeeRole) => {
  return (employeeData.roleDescriptions as any)[role]
}

export const getRoleModifiers = (role: EmployeeRole) => {
  return (employeeData.roleModifiers as any)[role]
}

export const getBaseSalary = (role: EmployeeRole) => {
  return (employeeData.baseSalaries as any)[role]
}

export const getStarMultiplier = (stars: EmployeeStars) => {
  // stars is 1-based, array is 0-based
  return employeeData.starMultipliers[stars - 1] || 1.0
}

export const getRandomFirstName = () => {
  const names = employeeData.firstNames
  return names[Math.floor(Math.random() * names.length)]
}

export const getRandomLastName = () => {
  const names = employeeData.lastNames
  return names[Math.floor(Math.random() * names.length)]
}

export const getRandomHumanTraits = (count: number = 1) => {
  const traits = employeeData.humanTraits
  const result: string[] = []
  const available = [...traits]

  for (let i = 0; i < count; i++) {
    if (available.length === 0) break
    const index = Math.floor(Math.random() * available.length)
    result.push(available[index])
    available.splice(index, 1)
  }

  return result
}

// --- Business Events Data ---
export const getBusinessEventsData = () => businessEvents

export const getRandomNegativeEvent = () => {
  const events = businessEvents.negativeEvents
  return events[Math.floor(Math.random() * events.length)]
}

export const getRandomPositiveEvent = () => {
  const events = businessEvents.positiveEvents
  return events[Math.floor(Math.random() * events.length)]
}

// --- Idea Templates ---
export const getIdeaTemplates = () => ideaTemplates.templates as unknown as IdeaTemplate[]
export const getIdeaReplacements = () => ideaTemplates.replacements

// --- Crisis Options ---
export const getCrisisOptions = () => crisisOptions

// --- Countries ---
// Приводим JSON к типу CountryEconomy через unknown, чтобы не ломать типы при добавлении новых полей
export const getInitialCountries = () => countries as unknown as Record<string, CountryEconomy>

// --- Country Archetypes ---
export const getCountryArchetypes = () => countryArchetypes
