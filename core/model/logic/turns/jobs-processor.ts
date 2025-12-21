import { formatGameDate } from '@/core/lib/quarter'
import type { JobApplication, Skill, Notification } from '@/core/types'
import type { EconomicCycle } from '@/core/types/economy.types'

interface JobsResult {
  updatedSkills: Skill[]
  notifications: Notification[]
  remainingApplications: JobApplication[]
  protectedSkills: string[]
  updatedJobs: any[]
}

export function processJobs(
  jobs: any[],
  pendingApplications: JobApplication[],
  updatedSkills: Skill[],
  currentTurn: number,
  currentYear: number,
  cycle?: EconomicCycle,
): JobsResult {
  const notifications: Notification[] = []
  const protectedSkills = new Set<string>()
  const updatedJobs: any[] = []

  // 1. Process Jobs
  for (const job of jobs) {
    let isFired = false

    if (cycle) {
      let risk = 0.01

      if (cycle.phase === 'recession') risk += 0.15
      if (cycle.phase === 'growth') risk -= 0.005

      const tenure = currentTurn - (job.startedTurn ?? currentTurn)
      if (tenure < 4) risk += 0.1
      if (tenure > 12) risk -= 0.05

      risk = Math.min(0.5, Math.max(0, risk))

      if (Math.random() < risk) {
        isFired = true
        notifications.push({
          id: `fired_${job.id}_${currentTurn}`,
          type: 'warning',
          title: 'Вас уволили! 😱',
          message: `Вы были уволены с должности ${job.title}.`,
          date: formatGameDate(currentYear, currentTurn),
          isRead: false,
        })
      }
    }

    if (!isFired) {
      updatedJobs.push(job)

      job.requirements?.skills?.forEach((req: any) => {
        protectedSkills.add(req.name)

        const idx = updatedSkills.findIndex((s) => s.name === req.name)
        if (idx !== -1) {
          const skill = { ...updatedSkills[idx] }
          skill.progress += 15
          skill.lastPracticedTurn = currentTurn
          ;(skill as any).isBeingUsedAtWork = true

          if (skill.progress >= 100) {
            skill.level += 1 as any
            skill.progress = 0
            notifications.push({
              id: `skill_up_${skill.name}_${currentTurn}`,
              type: 'success',
              title: 'Рост навыка',
              message: `Навык ${skill.name} повышен до ${skill.level}!`,
              date: formatGameDate(currentYear, currentTurn),
              isRead: false,
            })
          }

          updatedSkills[idx] = skill
        }
      })
    }
  }

  // 2. Job Applications
  const remainingApplications: JobApplication[] = []

  for (const app of pendingApplications) {
    let score = 0
    let match = true

    for (const req of app.requirements ?? []) {
      const skill = updatedSkills.find((s) => s.name === req.skillId)
      if (!skill || skill.level < req.minLevel) match = false
      else score += skill.level - req.minLevel
    }

    const chance = match ? Math.min(0.95, 0.6 + score * 0.1) : 0.05

    if (Math.random() < chance) {
      notifications.push({
        id: `offer_${app.id}_${currentTurn}`,
        type: 'job_offer',
        title: '🎉 Оффер!',
        message: `Вам предложили работу ${app.jobTitle} в ${app.company}.`,
        date: formatGameDate(currentYear, currentTurn),
        isRead: false,
        data: {
          applicationId: app.id,
          jobTitle: app.jobTitle,
          company: app.company,
          salary: app.salary,
          cost: app.cost,
          requirements: app.requirements ?? [],
        },
      })
    } else {
      notifications.push({
        id: `reject_${app.id}_${currentTurn}`,
        type: 'info',
        title: '❌ Отказ',
        message: `Компания ${app.company} отклонила вашу заявку.`,
        date: formatGameDate(currentYear, currentTurn),
        isRead: false,
      })
    }
  }

  // 3. Skill decay
  updatedSkills = updatedSkills.map((skill) => {
    if (
      protectedSkills.has(skill.name) ||
      (skill as any).isBeingStudied ||
      (skill as any).isBeingUsedAtWork
    ) {
      return skill
    }

    const idleTurns = currentTurn - (skill.lastPracticedTurn ?? 0)
    if (idleTurns > 4) {
      const decay = (idleTurns - 4) * 5
      skill.progress = Math.max(0, skill.progress - decay)
    }

    return skill
  })

  return {
    updatedSkills,
    notifications,
    remainingApplications,
    protectedSkills: [...protectedSkills],
    updatedJobs,
  }
}
