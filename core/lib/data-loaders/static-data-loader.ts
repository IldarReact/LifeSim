import { WORLD_COUNTRIES } from './economy-loader'

import type { EmployeeRole, EmployeeStars, EmployeeData } from '@/core/types/business.types'
import type { CountryEconomy } from '@/core/types/economy.types'
import type { IdeaTemplate, IdeaReplacements } from '@/core/types/idea.types'
import businessEvents from '@/shared/data/business/business-events.json'
import ideaTemplates from '@/shared/data/business/idea-templates.json'
const employeeData = _employeeData as unknown as EmployeeData
import crisisOptions from '@/shared/data/events/crisis-options.json'

// Country Candidates
import _employeeData from '@/shared/data/employees/employee-data.json'
import brazilCandidates from '@/shared/data/world/countries/brazil/candidates.json'
import germanyCandidates from '@/shared/data/world/countries/germany/candidates.json'
import usCandidates from '@/shared/data/world/countries/us/candidates.json'
import countryArchetypes from '@/shared/data/world/country-archetypes.json'

const COUNTRY_CANDIDATES: Record<string, { firstNames: string[]; lastNames: string[] }> = {
  brazil: brazilCandidates,
  germany: germanyCandidates,
  us: usCandidates,
}

// Types

// --- Employees Data ---
export const getEmployeeData = () => employeeData

export const getRoleDescription = (role: EmployeeRole) => {
  return employeeData.roleDescriptions[role]
}

export const getRoleModifiers = (role: EmployeeRole) => {
  return employeeData.roleModifiers[role]
}

export const getBaseSalary = (role: EmployeeRole) => {
  return employeeData.baseSalaries[role]
}

export const getStarMultiplier = (stars: EmployeeStars) => {
  // stars is 1-based, array is 0-based
  return employeeData.starMultipliers[stars - 1] || 1.0
}

export const getRandomFirstName = (countryId?: string) => {
  const countryData = countryId ? COUNTRY_CANDIDATES[countryId] : null
  const names = countryData?.firstNames || employeeData.firstNames
  return names[Math.floor(Math.random() * names.length)]
}

export const getRandomLastName = (countryId?: string) => {
  const countryData = countryId ? COUNTRY_CANDIDATES[countryId] : null
  const names = countryData?.lastNames || employeeData.lastNames
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
export const getIdeaReplacements = () => ideaTemplates.replacements as unknown as IdeaReplacements

// --- Crisis Options ---
export const getCrisisOptions = () => crisisOptions

// --- Countries ---
export const getInitialCountries = () =>
  WORLD_COUNTRIES as unknown as Record<string, CountryEconomy>

// --- Country Archetypes ---
export const getCountryArchetypes = () => countryArchetypes
