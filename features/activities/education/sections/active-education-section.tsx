import React from 'react'

import { ActiveEducationCard } from '../components/active-education-card'

import { SectionSeparator } from '@/shared/ui/section-separator'
import type { ActiveUniversity, ActiveCourse } from '@/core/types'

interface ActiveEducationSectionProps {
  activeUniversity: ActiveUniversity[]
  activeCourses: ActiveCourse[]
  hasActiveEducation: boolean
}

export const ActiveEducationSection: React.FC<ActiveEducationSectionProps> = ({
  activeUniversity,
  activeCourses,
  hasActiveEducation,
}) => {
  if (!hasActiveEducation) return null

  return (
    <div className="space-y-4">
      <SectionSeparator title="В процессе обучения" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeUniversity.map((uni) => (
          <ActiveEducationCard
            key={uni.id}
            title={uni.programName}
            progress={uni.totalDuration - uni.remainingDuration}
            total={uni.totalDuration}
            energy={uni.costPerTurn?.energy || 0}
          />
        ))}
        {activeCourses.map((course) => (
          <ActiveEducationCard
            key={course.id}
            title={course.courseName}
            progress={course.totalDuration - course.remainingDuration}
            total={course.totalDuration}
            energy={course.costPerTurn?.energy || 0}
          />
        ))}
      </div>
    </div>
  )
}
