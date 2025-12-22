import { getInflatedBaseSalary } from '../calculations/price-helpers'

import {
  getBaseSalary,
  getStarMultiplier,
  getRandomFirstName,
  getRandomLastName,
  getRandomHumanTraits,
} from '@/core/lib/data-loaders/static-data-loader'
import {
  EmployeeCandidate,
  EmployeeRole,
  EmployeeStars,
  EmployeeSkills,
  Employee,
} from '@/core/types/business.types'
import type { CountryEconomy } from '@/core/types/economy.types'

/**
 * Создает объект сотрудника с заданными параметрами
 */
export function createEmployeeObject(params: {
  id?: string
  name: string
  role: EmployeeRole
  stars?: EmployeeStars
  skills?: EmployeeSkills
  salary: number
  experience?: number
  humanTraits?: string[]
  productivity?: number
  effortPercent?: number
}): Employee {
  return {
    id: params.id || `employee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: params.name,
    role: params.role,
    stars: params.stars || 3,
    skills: params.skills || { efficiency: 50 },
    salary: params.salary,
    productivity: params.productivity ?? 75,
    experience: params.experience || 0,
    humanTraits: params.humanTraits || [],
    effortPercent: params.effortPercent || 100,
  }
}

/**
 * Создает объект сотрудника на основе кандидата
 */
export function createEmployeeFromCandidate(candidate: EmployeeCandidate): Employee {
  return createEmployeeObject({
    name: candidate.name,
    role: candidate.role,
    stars: candidate.stars,
    skills: candidate.skills,
    salary: candidate.requestedSalary,
    experience: candidate.experience,
    humanTraits: candidate.humanTraits,
  })
}

/**
 * Генерирует случайные навыки для сотрудника на основе роли и звезд
 */
export function generateSkills(role: EmployeeRole, stars: EmployeeStars): EmployeeSkills {
  // Базовая эффективность: 40 + (звезды * 10) + рандом
  const baseEfficiency = 40
  const starBonus = stars * 10
  const randomVariation = Math.random() * 20 - 10

  const efficiency = Math.min(100, Math.max(10, baseEfficiency + starBonus + randomVariation))

  return { efficiency }
}

/**
 * Рассчитывает зарплату на основе роли и звезд с учетом инфляции
 */
export function calculateSalary(
  role: EmployeeRole,
  stars: EmployeeStars,
  economy?: CountryEconomy,
): number {
  const baseSalary = getBaseSalary(role) || 1000

  // Применяем инфляцию к базовой зарплате
  const inflatedBaseSalary = economy ? getInflatedBaseSalary(baseSalary, economy) : baseSalary

  // Множитель зарплаты от звезд (экспоненциальный рост)
  const starMultiplier = getStarMultiplier(stars)

  return Math.round(inflatedBaseSalary * starMultiplier)
}

/**
 * Генерирует кандидата на работу
 */
export function generateEmployeeCandidate(
  role: EmployeeRole,
  stars?: EmployeeStars,
  economy?: CountryEconomy,
): EmployeeCandidate {
  // Распределение звезд если не указано: 1★ (40%), 2★ (30%), 3★ (20%), 4★ (8%), 5★ (2%)
  let candidateStars: EmployeeStars = 1
  if (stars) {
    candidateStars = stars
  } else {
    const rand = Math.random()
    if (rand > 0.98) candidateStars = 5
    else if (rand > 0.9) candidateStars = 4
    else if (rand > 0.7) candidateStars = 3
    else if (rand > 0.4) candidateStars = 2
  }

  const firstName = getRandomFirstName()
  const lastName = getRandomLastName()
  const skills = generateSkills(role, candidateStars)
  const salary = calculateSalary(role, candidateStars, economy)

  // Генерируем случайную аватарку (unsplash)
  const avatarId = Math.floor(Math.random() * 1000)
  const avatar = `https://i.pravatar.cc/150?u=${avatarId}`

  const experience = {
    1: Math.floor(Math.random() * 4),
    2: 4 + Math.floor(Math.random() * 8),
    3: 12 + Math.floor(Math.random() * 12),
    4: 24 + Math.floor(Math.random() * 24),
    5: 48 + Math.floor(Math.random() * 48),
  }[candidateStars]

  // Генерируем 1-3 случайные черты характера
  const traitCount = 1 + Math.floor(Math.random() * 3)
  const humanTraits = getRandomHumanTraits(traitCount)

  return {
    id: `candidate_${Date.now()}_${Math.random()}`,
    name: `${firstName} ${lastName}`,
    role,
    stars: candidateStars,
    skills,
    requestedSalary: salary,
    experience,
    avatar,
    humanTraits,
  }
}

/**
 * Генерирует несколько кандидатов для выбора
 */
export function generateCandidates(
  role: EmployeeRole,
  count: number = 3,
  economy?: CountryEconomy,
): EmployeeCandidate[] {
  const candidates: EmployeeCandidate[] = []
  for (let i = 0; i < count; i++) {
    candidates.push(generateEmployeeCandidate(role, undefined, economy))
  }
  return candidates
}
