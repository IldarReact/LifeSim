import type { EmployeeCandidate, EmployeeRole, EmployeeStars, EmployeeSkills } from "@/core/types/business.types";
import {
  getRoleModifiers,
  getBaseSalary,
  getStarMultiplier,
  getRandomFirstName,
  getRandomLastName,
  getRandomHumanTraits
} from '@/core/lib/data-loaders/static-data-loader';

/**
 * Генерирует случайные навыки для сотрудника на основе роли и звезд
 */
export function generateSkills(role: EmployeeRole, stars: EmployeeStars): EmployeeSkills {
  const baseSkills = {
    efficiency: 40,
    salesAbility: 40,
    technical: 40,
    management: 40,
    creativity: 40
  };

  // Модификаторы по звездам (1 звезда = +10 к базе, 5 звезд = +50)
  const starBonus = stars * 10;

  // Модификаторы по роли
  const modifiers = getRoleModifiers(role) as Partial<EmployeeSkills> || {};

  const skills = { ...baseSkills };

  // Применяем модификаторы роли
  Object.keys(modifiers).forEach(key => {
    const skillKey = key as keyof EmployeeSkills;
    skills[skillKey] += modifiers[skillKey] || 0;
  });

  // Применяем бонус звезд ко всем навыкам с рандомом
  Object.keys(skills).forEach(key => {
    const skillKey = key as keyof EmployeeSkills;
    skills[skillKey] = Math.min(100, Math.max(10, skills[skillKey] + starBonus + (Math.random() * 20 - 10)));
  });

  return skills;
}

/**
 * Рассчитывает зарплату на основе роли и звезд
 */
export function calculateSalary(role: EmployeeRole, stars: EmployeeStars): number {
  const baseSalary = getBaseSalary(role) || 1000;

  // Множитель зарплаты от звезд (экспоненциальный рост)
  const starMultiplier = getStarMultiplier(stars);

  return Math.round(baseSalary * starMultiplier);
}

/**
 * Генерирует кандидата на работу
 */
export function generateEmployeeCandidate(role: EmployeeRole, stars?: EmployeeStars): EmployeeCandidate {
  // Распределение звезд если не указано: 1★ (40%), 2★ (30%), 3★ (20%), 4★ (8%), 5★ (2%)
  let candidateStars: EmployeeStars = 1;
  if (stars) {
    candidateStars = stars;
  } else {
    const rand = Math.random();
    if (rand > 0.98) candidateStars = 5;
    else if (rand > 0.90) candidateStars = 4;
    else if (rand > 0.70) candidateStars = 3;
    else if (rand > 0.40) candidateStars = 2;
  }

  const firstName = getRandomFirstName();
  const lastName = getRandomLastName();
  const skills = generateSkills(role, candidateStars);
  const salary = calculateSalary(role, candidateStars);

  const experience = {
    1: Math.floor(Math.random() * 4),
    2: 4 + Math.floor(Math.random() * 8),
    3: 12 + Math.floor(Math.random() * 12),
    4: 24 + Math.floor(Math.random() * 24),
    5: 48 + Math.floor(Math.random() * 48)
  }[candidateStars];

  // Генерируем 1-3 случайные черты характера
  const traitCount = 1 + Math.floor(Math.random() * 3);
  const humanTraits = getRandomHumanTraits(traitCount);

  return {
    id: `candidate_${Date.now()}_${Math.random()}`,
    name: `${firstName} ${lastName}`,
    role,
    stars: candidateStars,
    skills,
    requestedSalary: salary,
    experience,
    humanTraits
  };
}

/**
 * Генерирует несколько кандидатов для выбора
 */
export function generateCandidates(role: EmployeeRole, count: number = 3): EmployeeCandidate[] {
  const candidates: EmployeeCandidate[] = [];
  for (let i = 0; i < count; i++) {
    candidates.push(generateEmployeeCandidate(role));
  }
  return candidates;
}
