/**
 * Layer 3: Process Active Courses
 *
 * ✅ Pure function — takes course data, returns completed courses
 * ✅ No dependencies on store
 * ✅ Single responsibility: handle course progression and completion
 */

import type { Skill, SkillLevel, ActiveCourse, Notification } from '@/core/types'
import { formatGameDate } from '../quarter'

export interface CourseProcessingResult {
  updatedCourses: ActiveCourse[]
  completedCourses: string[]
  skillUpdates: Skill[]
  notifications: Notification[]
  protectedSkills: Set<string>
}

/**
 * Processes active courses for the current turn
 * - Decrements remaining duration
 * - Completes courses when duration reaches 0
 * - Updates/creates skills from completed courses
 *
 * @param activeCourses - List of active courses
 * @param currentSkills - Player's current skills
 * @param currentTurn - Current game turn
 * @param currentYear - Current game year
 * @returns Updated courses, skills, notifications, and protected skills
 */
export function processActiveCourses(
  activeCourses: ActiveCourse[],
  currentSkills: Skill[],
  currentTurn: number,
  currentYear: number,
): CourseProcessingResult {
  const updatedSkills = [...currentSkills]
  const completedCourses: string[] = []
  const notifications: Notification[] = []
  const protectedSkills = new Set<string>()

  const processedCourses = activeCourses
    .map((course) => {
      const updatedCourse = { ...course }
      updatedCourse.remainingDuration -= 1
      protectedSkills.add(course.skillName)

      if (updatedCourse.remainingDuration <= 0) {
        completedCourses.push(updatedCourse.id)
        const levelsGained = Math.ceil(course.totalDuration)
        let skillIdx = updatedSkills.findIndex((s) => s.name === course.skillName)

        if (skillIdx === -1) {
          // New skill
          const newLevel = Math.min(5, levelsGained) as SkillLevel
          updatedSkills.push({
            id: `skill_${Date.now()}_${Math.random()}`,
            name: course.skillName,
            level: newLevel,
            progress: 0,
            lastPracticedTurn: currentTurn,
            isBeingStudied: false,
          })
          notifications.push({
            id: `course_end_${Date.now()}_${Math.random()}`,
            type: 'success',
            title: 'Курс завершен',
            message: `Вы завершили курс "${course.courseName}" и получили навык ${course.skillName} (${newLevel} зв.)!`,
            date: formatGameDate(currentYear, currentTurn),
            isRead: false,
          })
        } else {
          // Existing skill
          const skill = { ...updatedSkills[skillIdx] }
          skill.level = Math.min(5, skill.level + levelsGained) as SkillLevel
          skill.progress = 0
          skill.lastPracticedTurn = currentTurn
          updatedSkills[skillIdx] = skill
          notifications.push({
            id: `course_end_${Date.now()}_${Math.random()}`,
            type: 'success',
            title: 'Курс завершен',
            message: `Вы завершили курс "${course.courseName}". Навык ${skill.name} повышен до ${skill.level} зв.!`,
            date: formatGameDate(currentYear, currentTurn),
            isRead: false,
          })
        }
      }

      return updatedCourse
    })
    .filter((course) => !completedCourses.includes(course.id))

  return {
    updatedCourses: processedCourses,
    completedCourses,
    skillUpdates: updatedSkills,
    notifications,
    protectedSkills,
  }
}
