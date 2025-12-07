/**
 * Layer 3: Process Jobs and Skill Progression
 *
 * ✅ Pure function — processes job skills and leveling
 * ✅ No dependencies on store
 * ✅ Single responsibility: handle skill progression from work
 */

import type { Skill, SkillLevel, Job, Notification } from '@/core/types'

export interface JobSkillProgressionResult {
  skillUpdates: Skill[]
  notifications: Notification[]
  protectedSkills: Set<string>
}

/**
 * Processes skill progression from active jobs
 * - Protects skills being used at work
 * - Increments skill progress based on job requirements
 * - Levels up skills when progress reaches 100
 *
 * @param jobs - Player's active jobs
 * @param currentSkills - Player's current skills
 * @param currentTurn - Current game turn
 * @param currentYear - Current game year
 * @returns Updated skills, notifications, and protected skills
 */
export function processJobSkillProgression(
  jobs: Job[],
  currentSkills: Skill[],
  currentTurn: number,
  currentYear: number,
): JobSkillProgressionResult {
  const updatedSkills = [...currentSkills]
  const notifications: Notification[] = []
  const protectedSkills = new Set<string>()

  jobs.forEach((job) => {
    if (job.requirements?.skills) {
      job.requirements.skills.forEach((req) => {
        const skillName = req.name
        protectedSkills.add(skillName)
        let skillIdx = updatedSkills.findIndex((s) => s.name === skillName)

        if (skillIdx !== -1) {
          const skill = { ...updatedSkills[skillIdx] }

          // Only progress below level 4
          if (skill.level < 4) {
            skill.progress += 15
            skill.lastPracticedTurn = currentTurn
            skill.isBeingUsedAtWork = true

            // Level up on 100+ progress
            if (skill.progress >= 100) {
              skill.level = (skill.level + 1) as SkillLevel
              skill.progress = 0
              notifications.push({
                id: `work_lvl_${Date.now()}_${Math.random()}`,
                type: 'success',
                title: 'Профессиональный рост',
                message: `Благодаря работе ваш навык ${skill.name} повысился до уровня ${skill.level}!`,
                date: `${currentYear} Q${currentTurn % 4 || 4}`,
                isRead: false,
              })
            }

            updatedSkills[skillIdx] = skill
          }
        }
      })
    }
  })

  return {
    skillUpdates: updatedSkills,
    notifications,
    protectedSkills,
  }
}
