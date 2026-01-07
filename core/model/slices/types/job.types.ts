import type { JobApplication } from '@/core/types'
import type { SkillRequirement } from '@/core/types/skill.types'
import type { StatEffect } from '@/core/types/stats.types'

export interface JobSlice {
  pendingApplications: JobApplication[]

  // Actions
  applyForJob: (
    jobTitle: string,
    company: string,
    salary: number,
    cost: StatEffect,
    requirements: SkillRequirement[],
  ) => void
  acceptJobOffer: (applicationId: string) => void
  quitJob: (jobId: string) => void
  askForRaise: (jobId: string) => void

  // ✅ Multiplayer Job Actions
  acceptExternalJob: (jobTitle: string, company: string, salary: number, businessId: string) => void
}
