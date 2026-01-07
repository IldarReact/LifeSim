import React from 'react'

import { SkillCard } from '../components/skill-card'

import { SectionSeparator } from '@/shared/ui/section-separator'
import type { Skill } from '@/core/types'

interface SkillsSectionProps {
  skills: Skill[]
  hasSkills: boolean
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, hasSkills }) => {
  return (
    <div className="space-y-4">
      <SectionSeparator title="Текущие навыки" />

      {!hasSkills ? (
        <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
          <p className="text-white/50">
            У вас пока нет изученных навыков. Пройдите обучение, чтобы их получить.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <SkillCard key={skill.id} name={skill.name} level={skill.level} />
          ))}
        </div>
      )}
    </div>
  )
}
