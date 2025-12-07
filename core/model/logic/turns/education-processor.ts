import type { Notification, Skill, SkillLevel } from '@/core/types'

interface EducationResult {
  activeCourses: Array<any>
  activeUniversity: Array<any>
  updatedSkills: Skill[]
  notifications: Notification[]
  protectedSkills: string[]
}

/**
 * Process active courses and university studies for the turn.
 * Updates durations, awards skill levels when finished, and produces notifications.
 */
export function processEducation(
  activeCourses: Array<any>,
  activeUniversity: Array<any>,
  updatedSkills: Skill[],
  currentTurn: number,
  currentYear: number,
): EducationResult {
  const newNotifications: Notification[] = []
  const protectedSkills = new Set<string>()

  // Courses
  const finishedCourses: string[] = []
  activeCourses = activeCourses
    .map((c) => {
      const course = { ...c }
      course.remainingDuration -= 1
      protectedSkills.add(course.skillName)

      if (course.remainingDuration <= 0) {
        finishedCourses.push(course.id)
        const levelsGained = Math.ceil(course.totalDuration)
        let skillIdx = updatedSkills.findIndex((s) => s.name === course.skillName)

        if (skillIdx === -1) {
          const newLevel = Math.min(5, levelsGained) as SkillLevel
          updatedSkills.push({
            id: `skill_${Date.now()}_${Math.random()}`,
            name: course.skillName,
            level: newLevel,
            progress: 0,
            lastPracticedTurn: currentTurn,
            isBeingStudied: false,
          })
          newNotifications.push({
            id: `course_end_${Date.now()}_${Math.random()}`,
            type: 'success',
            title: 'Курс завершен',
            message: `Вы завершили курс "${course.courseName}" и получили навык ${course.skillName} (${newLevel} зв.)!`,
            date: `${currentYear} Q${currentTurn % 4 || 4}`,
            isRead: false,
          })
        } else {
          const skill = { ...updatedSkills[skillIdx] }
          skill.level = Math.min(5, skill.level + levelsGained) as SkillLevel
          skill.progress = 0
          skill.lastPracticedTurn = currentTurn
          updatedSkills[skillIdx] = skill
          newNotifications.push({
            id: `course_end_${Date.now()}_${Math.random()}`,
            type: 'success',
            title: 'Курс завершен',
            message: `Вы завершили курс "${course.courseName}". Навык ${skill.name} повышен до ${skill.level} зв.!`,
            date: `${currentYear} Q${currentTurn % 4 || 4}`,
            isRead: false,
          })
        }
      }
      return course
    })
    .filter((c) => !finishedCourses.includes(c.id))

  // University
  const finishedUni: string[] = []
  activeUniversity = activeUniversity
    .map((u) => {
      const uni = { ...u }
      uni.remainingDuration -= 1
      protectedSkills.add(uni.skillName)

      if (uni.remainingDuration <= 0) {
        finishedUni.push(uni.id)
        const levelsGained = Math.ceil(uni.totalDuration)
        let skillIdx = updatedSkills.findIndex((s) => s.name === uni.skillName)

        if (skillIdx === -1) {
          const newLevel = Math.min(5, levelsGained) as SkillLevel
          updatedSkills.push({
            id: `skill_${Date.now()}_${Math.random()}`,
            name: uni.skillName,
            level: newLevel,
            progress: 0,
            lastPracticedTurn: currentTurn,
            isBeingStudied: false,
          })
          newNotifications.push({
            id: `uni_end_${Date.now()}_${Math.random()}`,
            type: 'success',
            title: 'Диплом получен',
            message: `Поздравляем! Вы завершили обучение по программе "${uni.programName}" и получили навык ${uni.skillName} (${newLevel} зв.)!`,
            date: `${currentYear} Q${currentTurn % 4 || 4}`,
            isRead: false,
          })
        } else {
          const skill = { ...updatedSkills[skillIdx] }
          skill.level = Math.min(5, skill.level + levelsGained) as SkillLevel
          skill.progress = 0
          skill.lastPracticedTurn = currentTurn
          updatedSkills[skillIdx] = skill
          newNotifications.push({
            id: `uni_end_${Date.now()}_${Math.random()}`,
            type: 'success',
            title: 'Диплом получен',
            message: `Поздравляем! Вы завершили обучение по программе "${uni.programName}". Навык ${skill.name} повышен до ${skill.level} зв.!`,
            date: `${currentYear} Q${currentTurn % 4 || 4}`,
            isRead: false,
          })
        }
      }
      return uni
    })
    .filter((u) => !finishedUni.includes(u.id))

  return {
    activeCourses,
    activeUniversity,
    updatedSkills,
    notifications: newNotifications,
    protectedSkills: Array.from(protectedSkills),
  }
}
