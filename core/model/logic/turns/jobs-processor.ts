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
  jobs: Array<any>,
  pendingApplications: JobApplication[],
  updatedSkills: Skill[],
  currentTurn: number,
  cycle?: EconomicCycle
): JobsResult {
  const newNotifications: Notification[] = []
  const protectedSkills = new Set<string>()
  const updatedJobs: any[] = []

  // 3. Process Jobs (skill usage at work & firing risk)
  jobs.forEach((job) => {
    let isFired = false

    // Firing Logic (only for external jobs, not own business)
    // Assuming own business jobs have a specific flag or we check job source
    // For now, apply to all "jobs" in the list (usually external)
    if (cycle) {
      let risk = 0.01 // Base 1%

      // Cycle Risk
      if (cycle.phase === 'recession') risk += 0.15
      else if (cycle.phase === 'growth') risk -= 0.005

      // Tenure Risk (Newbie)
      const tenure = currentTurn - (job.startedTurn || currentTurn)
      if (tenure < 4) risk += 0.10 // +10% for < 1 year
      else if (tenure > 12) risk -= 0.05 // -5% for > 3 years

      // Cap risk
      risk = Math.max(0, Math.min(0.5, risk))

      if (Math.random() < risk) {
        isFired = true
        newNotifications.push({
          id: `fired_${Date.now()}_${Math.random()}`,
          type: 'warning',
          title: 'Вас уволили! 😱',
          message: `К сожалению, вы попали под сокращение на должности ${job.title}. ${cycle.phase === 'recession' ? 'Кризис вынуждает компании резать косты.' : 'Вы были на испытательном сроке.'}`,
          date: `${Math.floor(currentTurn / 4)} Q${currentTurn % 4 || 4}`,
          isRead: false,
        } as unknown as Notification)
      }
    }

    if (!isFired) {
      updatedJobs.push(job)
      if (job.requirements?.skills) {
        job.requirements.skills.forEach((req: any) => {
          const skillName = req.name
          protectedSkills.add(skillName)
          let skillIdx = updatedSkills.findIndex((s) => s.name === skillName)
          if (skillIdx !== -1) {
            const skill = { ...updatedSkills[skillIdx] }
            if (skill.level < 4) {
              skill.progress += 15
              skill.lastPracticedTurn = currentTurn
                // mark as used at work (may be read by other processors)
                ; (skill as any).isBeingUsedAtWork = true
              if (skill.progress >= 100) {
                skill.level = (skill.level + 1) as any
                skill.progress = 0
                newNotifications.push({
                  id: `work_lvl_${Date.now()}_${Math.random()}`,
                  type: 'success',
                  title: 'Профессиональный рост',
                  message: `Благодаря работе ваш навык ${skill.name} повысился до уровня ${skill.level}!`,
                  date: `${Math.floor(currentTurn / 4)} Q${currentTurn % 4 || 4}`,
                  isRead: false,
                } as unknown as Notification)
              }
              updatedSkills[skillIdx] = skill
            }
          }
        })
      }
    }
  })

  // 4. Job Applications
  const remainingApplications: JobApplication[] = []
  pendingApplications.forEach((app) => {
    let skillsMatch = true
    let matchScore = 0
    if (app.requirements && app.requirements.length > 0) {
      app.requirements.forEach((req: any) => {
        const reqName = req.skillId
        const reqLevel = req.minLevel
        const playerSkill = updatedSkills.find((s) => s.name === reqName)
        const playerLevel = playerSkill ? playerSkill.level : 0
        if (playerLevel < reqLevel) {
          skillsMatch = false
        } else {
          matchScore += playerLevel - reqLevel
        }
      })
    }
    let chance = skillsMatch ? 0.6 + matchScore * 0.1 : 0.05
    if (chance > 0.95) chance = 0.95
    const isOffer = Math.random() < chance
    if (isOffer) {
      newNotifications.push({
        id: `offer_${Date.now()}_${Math.random()}`,
        type: 'job_offer',
        title: '🎉 Оффер!',
        message: `Поздравляем! Компания ${app.company} предлагает вам должность ${app.jobTitle} с зарплатой $${app.salary}/мес.`,
        date: `${Math.floor(currentTurn / 4)} Q${currentTurn % 4 || 4}`,
        isRead: false,
        data: {
          applicationId: app.id,
          jobTitle: app.jobTitle,
          company: app.company,
          salary: app.salary,
          cost: app.cost,
          requirements: app.requirements,
        },
      } as unknown as Notification)
    } else {
      const reason = !skillsMatch
        ? 'Ваши навыки не соответствуют требованиям вакансии.'
        : matchScore === 0
          ? 'К сожалению, был выбран другой кандидат с большим опытом.'
          : 'Высокая конкуренция на эту позицию.'
      newNotifications.push({
        id: `reject_${Date.now()}_${Math.random()}`,
        type: 'info',
        title: '❌ Отказ',
        message: `К сожалению, компания ${app.company} отклонила вашу заявку на должность ${app.jobTitle}. ${reason}`,
        date: `${Math.floor(currentTurn / 4)} Q${currentTurn % 4 || 4}`,
        isRead: false,
      } as unknown as Notification)
    }
  })

  // 5. Skill Decay
  updatedSkills = updatedSkills.map((skill) => {
    if (
      protectedSkills.has(skill.name) ||
      (skill as any).isBeingStudied ||
      (skill as any).isBeingUsedAtWork
    ) {
      return { ...skill, lastPracticedTurn: currentTurn }
    }
    const turnsSinceLastPractice = currentTurn - (skill.lastPracticedTurn || 0)
    if (turnsSinceLastPractice > 4) {
      const decayAmount = Math.floor((turnsSinceLastPractice - 4) * 5)
      const newProgress = Math.max(0, (skill.progress || 0) - decayAmount)
      if (newProgress === 0 && (skill.progress || 0) > 0) {
        if ((skill.level || 0) > 0) {
          return { ...skill, level: ((skill.level || 1) - 1) as any, progress: 50 }
        }
      }
      return { ...skill, progress: newProgress }
    }
    return skill
  })

  return {
    updatedSkills,
    notifications: newNotifications,
    remainingApplications,
    protectedSkills: Array.from(protectedSkills),
    updatedJobs,
  }
}
