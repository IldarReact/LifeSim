/**
 * Layer 3: Process Active University
 *
 * ✅ Pure function — takes university data, returns completed programs
 * ✅ No dependencies on store
 * ✅ Single responsibility: handle university progression and diploma completion
 */

import { formatGameDate } from '../quarter'

import type { Skill, SkillLevel, ActiveUniversity, Notification } from '@/core/types'

export interface UniversityProcessingResult {
  updatedUniversities: ActiveUniversity[]
  completedUni: string[]
  skillUpdates: Skill[]
  notifications: Notification[]
  protectedSkills: Set<string>
}

/**
 * Processes active university programs for the current turn
 * - Decrements remaining duration
 * - Completes programs when duration reaches 0
 * - Updates/creates skills from completed programs
 *
 * @param activeUniversities - List of active university programs
 * @param currentSkills - Player's current skills
 * @param currentTurn - Current game turn
 * @param currentYear - Current game year
 * @returns Updated programs, skills, notifications, and protected skills
 */
export function processActiveUniversity(
  activeUniversities: ActiveUniversity[],
  currentSkills: Skill[],
  currentTurn: number,
  currentYear: number,
): UniversityProcessingResult {
  const updatedSkills = [...currentSkills]
  const completedUni: string[] = []
  const notifications: Notification[] = []
  const protectedSkills = new Set<string>()

  const processedUni = activeUniversities
    .map((uni) => {
      const updatedUni = { ...uni }
      updatedUni.remainingDuration -= 1
      protectedSkills.add(uni.skillName)

      if (updatedUni.remainingDuration <= 0) {
        completedUni.push(updatedUni.id)
        const levelsGained = Math.ceil(uni.totalDuration)
        const skillIdx = updatedSkills.findIndex((s) => s.name === uni.skillName)

        if (skillIdx === -1) {
          // New skill from diploma
          const newLevel = Math.min(5, levelsGained) as SkillLevel
          updatedSkills.push({
            id: `skill_${Date.now()}_${Math.random()}`,
            name: uni.skillName,
            level: newLevel,
            progress: 0,
            lastPracticedTurn: currentTurn,
            isBeingStudied: false,
          })
          notifications.push({
            id: `uni_end_${Date.now()}_${Math.random()}`,
            type: 'success',
            title: 'Диплом получен',
            message: `Поздравляем! Вы завершили обучение по программе "${uni.programName}" и получили навык ${uni.skillName} (${newLevel} зв.)!`,
            date: formatGameDate(currentYear, currentTurn),
            isRead: false,
          })
        } else {
          // Boost existing skill
          const skill = { ...updatedSkills[skillIdx] }
          skill.level = Math.min(5, skill.level + levelsGained) as SkillLevel
          skill.progress = 0
          skill.lastPracticedTurn = currentTurn
          updatedSkills[skillIdx] = skill
          notifications.push({
            id: `uni_end_${Date.now()}_${Math.random()}`,
            type: 'success',
            title: 'Диплом получен',
            message: `Поздравляем! Вы завершили обучение по программе "${uni.programName}". Навык ${skill.name} повышен до ${skill.level} зв.!`,
            date: formatGameDate(currentYear, currentTurn),
            isRead: false,
          })
        }
      }

      return updatedUni
    })
    .filter((uni) => !completedUni.includes(uni.id))

  return {
    updatedUniversities: processedUni,
    completedUni,
    skillUpdates: updatedSkills,
    notifications,
    protectedSkills,
  }
}
