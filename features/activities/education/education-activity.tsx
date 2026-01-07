'use client'

import React from 'react'

import { useEducation } from './hooks/use-education'
import { ActiveEducationSection } from './sections/active-education-section'
import { CoursesSection } from './sections/courses-section'
import { SkillsSection } from './sections/skills-section'
import { UniversitySection } from './sections/university-section'

import { FeedbackAnimation } from '@/shared/ui/feedback-animation'

export function EducationActivity(): React.JSX.Element | null {
  const {
    player,
    currentCountry,
    skills,
    activeCourses,
    activeUniversity,
    hasSkills,
    hasActiveEducation,
    getInflatedCoursePrice,
    handleCourseEnroll,
    handleUniversityApply,
    feedback,
    setFeedback,
  } = useEducation()

  if (!player) return null

  return (
    <React.Fragment>
      <FeedbackAnimation
        show={feedback.show}
        success={feedback.success}
        message={feedback.message}
        onComplete={() => setFeedback({ show: false, success: false, message: '' })}
      />

      <div className="space-y-8 pb-10">
        <SkillsSection skills={skills} hasSkills={hasSkills} />

        <ActiveEducationSection
          activeUniversity={activeUniversity}
          activeCourses={activeCourses}
          hasActiveEducation={hasActiveEducation}
        />

        <UniversitySection
          currentCountryName={currentCountry?.name}
          getInflatedCoursePrice={getInflatedCoursePrice}
          handleUniversityApply={handleUniversityApply}
        />

        <CoursesSection
          getInflatedCoursePrice={getInflatedCoursePrice}
          handleCourseEnroll={handleCourseEnroll}
        />
      </div>
    </React.Fragment>
  )
}
