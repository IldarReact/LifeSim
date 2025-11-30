import type { BusinessType } from './business.types'
import type { SkillRequirement } from './skill.types'

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high'
export type IdeaStage = 'idea' | 'prototype' | 'mvp' | 'launched'

/**
 * Бизнес-идея, которую игрок может развивать
 */
export interface BusinessIdea {
  id: string
  name: string
  description: string
  type: BusinessType

  // Требования для реализации
  requiredSkills: SkillRequirement[]
  minInvestment: number
  maxInvestment: number

  // Характеристики идеи
  riskLevel: RiskLevel
  potentialReturn: number // Множитель годовой прибыли (0.5 = 50%, 2.0 = 200%)
  marketDemand: number // 0-100, текущий спрос на рынке

  // Стадия развития
  stage: IdeaStage
  developmentProgress: number // 0-100, прогресс текущей стадии

  // Инвестиции
  investedAmount: number // Сколько уже вложено

  // Метаданные
  generatedTurn: number
  expiresIn: number // Через сколько кварталов идея устареет (0 = бессрочно)
}

/**
 * Шаблон для генерации идей
 */
export interface IdeaTemplate {
  nameTemplates: string[]
  descriptionTemplates: string[]
  type: BusinessType
  requiredSkills: SkillRequirement[]
  riskRange: [RiskLevel, RiskLevel]
  returnRange: [number, number]
  investmentRange: [number, number]
}
