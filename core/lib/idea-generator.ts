import { getIdeaTemplates, getIdeaReplacements } from '@/core/lib/data-loaders/static-data-loader'
import type { Skill } from '@/core/types'
import type { BusinessIdea, RiskLevel } from '@/core/types/idea.types'

/**
 * Генерирует бизнес-идею на основе навыков игрока
 */
export function generateBusinessIdea(
  playerSkills: Skill[],
  currentTurn: number,
  globalMarketValue: number = 1.0
): BusinessIdea {
  const IDEA_TEMPLATES = getIdeaTemplates();
  const REPLACEMENTS = getIdeaReplacements();

  // Выбираем шаблон на основе навыков
  let template = IDEA_TEMPLATES[Math.floor(Math.random() * IDEA_TEMPLATES.length)]

  // Если у игрока есть программирование, больше шансов на tech
  const programmingSkill = playerSkills.find(s => s.name === 'Программирование')
  if (programmingSkill && programmingSkill.level >= 3 && Math.random() < 0.6) {
    template = IDEA_TEMPLATES.find(t => t.type === 'tech') || template
  }

  // Если у игрока есть менеджмент, больше шансов на service
  const managementSkill = playerSkills.find(s => s.name === 'Менеджмент')
  if (managementSkill && managementSkill.level >= 2 && Math.random() < 0.5) {
    template = IDEA_TEMPLATES.find(t => t.type === 'service') || template
  }

  // Генерируем название и описание
  const nameTemplate = template.nameTemplates[Math.floor(Math.random() * template.nameTemplates.length)]
  const descTemplate = template.descriptionTemplates[Math.floor(Math.random() * template.descriptionTemplates.length)]

  let name = nameTemplate
  let description = descTemplate

  // Используем replacements из JSON
  // Приводим ключи к нижнему регистру для соответствия с JSON (categories -> {category})
  // В JSON ключи: categories, niches, fields, products
  // В шаблонах: {category}, {niche}, {field}, {product}

  const mapping: Record<string, string> = {
    '{category}': 'categories',
    '{niche}': 'niches',
    '{field}': 'fields',
    '{product}': 'products'
  }

  for (const [placeholder, jsonKey] of Object.entries(mapping)) {
    if (name.includes(placeholder) || description.includes(placeholder)) {
      const options = REPLACEMENTS[jsonKey]
      if (options && options.length > 0) {
        const replacement = options[Math.floor(Math.random() * options.length)]
        name = name.replace(new RegExp(placeholder, 'g'), replacement)
        description = description.replace(new RegExp(placeholder, 'g'), replacement)
      }
    }
  }

  // Определяем риск
  const riskLevels: RiskLevel[] = ['low', 'medium', 'high', 'very_high']
  const minRiskIndex = riskLevels.indexOf(template.riskRange[0])
  const maxRiskIndex = riskLevels.indexOf(template.riskRange[1])
  const riskIndex = minRiskIndex + Math.floor(Math.random() * (maxRiskIndex - minRiskIndex + 1))
  const riskLevel = riskLevels[riskIndex]

  // Определяем потенциал (зависит от риска и рынка)
  const baseReturn = template.returnRange[0] + Math.random() * (template.returnRange[1] - template.returnRange[0])
  const riskMultiplier = riskIndex * 0.2 + 0.8 // 0.8 для low, 1.4 для very_high
  const potentialReturn = baseReturn * riskMultiplier * globalMarketValue

  // Определяем спрос (зависит от рынка и типа)
  const baseDemand = 50 + Math.random() * 30
  const marketDemand = Math.min(100, baseDemand * globalMarketValue)

  // Инвестиции
  const minInvestment = template.investmentRange[0]
  const maxInvestment = template.investmentRange[1]

  // Срок актуальности (больше для низкого риска)
  const expiresIn = riskLevel === 'low' ? 0 : riskLevel === 'medium' ? 8 : riskLevel === 'high' ? 4 : 2

  return {
    id: `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    type: template.type,
    requiredSkills: template.requiredSkills,
    minInvestment,
    maxInvestment,
    riskLevel,
    potentialReturn,
    marketDemand,
    stage: 'idea',
    developmentProgress: 0,
    investedAmount: 0,
    generatedTurn: currentTurn,
    expiresIn
  }
}

/**
 * Проверяет, соответствует ли игрок требованиям идеи
 */
export function canDevelopIdea(idea: BusinessIdea, playerSkills: Skill[]): boolean {
  return idea.requiredSkills.every(req => {
    const playerSkill = playerSkills.find(s => s.id === req.skillId)
    return playerSkill && playerSkill.level >= req.minLevel
  })
}

/**
 * Рассчитывает стоимость развития идеи до следующей стадии
 */
export function calculateDevelopmentCost(idea: BusinessIdea): number {
  const stageCosts: Record<typeof idea.stage, number> = {
    'idea': idea.minInvestment * 0.1, // 10% для прототипа
    'prototype': idea.minInvestment * 0.2, // 20% для MVP
    'mvp': idea.minInvestment * 0.7, // 70% для запуска
    'launched': 0
  }

  return stageCosts[idea.stage]
}

/**
 * Рассчитывает время развития (в кварталах)
 */
export function calculateDevelopmentTime(idea: BusinessIdea, playerSkills: Skill[]): number {
  const baseTimes: Record<typeof idea.stage, number> = {
    'idea': 2, // 2 квартала до прототипа
    'prototype': 3, // 3 квартала до MVP
    'mvp': 2, // 2 квартала до запуска
    'launched': 0
  }

  let time = baseTimes[idea.stage]

  // Навыки ускоряют развитие
  const relevantSkills = playerSkills.filter(s =>
    idea.requiredSkills.some(req => req.skillId === s.id)
  )

  const avgSkillLevel = relevantSkills.length > 0
    ? relevantSkills.reduce((sum, s) => sum + s.level, 0) / relevantSkills.length
    : 0

  // Каждый уровень навыка сокращает время на 10%
  const skillReduction = avgSkillLevel * 0.1
  time = Math.max(1, Math.round(time * (1 - skillReduction)))

  return time
}
