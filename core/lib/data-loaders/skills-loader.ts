import type { SkillDefinition } from '@/core/types/skill.types'
import skillsData from '@/shared/data/world/commons/skills.json'

function validateSkill(item: unknown): item is SkillDefinition {
  const s = item as SkillDefinition
  if (!s.id || typeof s.id !== 'string') return false
  if (!s.name || typeof s.name !== 'string') return false
  if (!s.description || typeof s.description !== 'string') return false
  // Validate category if present
  if (s.category && !['technical', 'language', 'social', 'creative', 'physical'].includes(s.category)) {
    return false
  }
  return true
}

export const ALL_SKILLS: SkillDefinition[] = skillsData.filter(validateSkill) as SkillDefinition[]

export function getSkillById(id: string): SkillDefinition | undefined {
  return ALL_SKILLS.find(s => s.id === id)
}

export function getSkillsByCategory(category: string): SkillDefinition[] {
  return ALL_SKILLS.filter(s => s.category === category)
}
