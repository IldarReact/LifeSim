import type { FreelanceApplication } from '@/core/types'
import type { SkillRequirement } from '@/core/types/skill.types'
import type { StatEffect } from '@/core/types/stats.types'

export interface FreelanceSlice {
  pendingFreelanceApplications: FreelanceApplication[]

  // Actions
  applyForFreelance: (
    gigId: string,
    title: string,
    payment: number,
    cost: StatEffect,
    requirements: SkillRequirement[],
  ) => void
  acceptFreelanceGig: (applicationId: string) => void
  completeFreelanceGig: (gigId: string) => void
}
