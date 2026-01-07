// Job-related types
import { SkillRequirement } from './skill.types'
import { StatEffect } from './stats.types'

export interface JobRequirements {
  education?: string
  skills?: { name: string; level: number }[]
  experience?: number
}

export interface Job {
  id: string
  title: string
  company: string
  salary: number // Monthly salary
  category?: string
  cost: StatEffect
  imageUrl: string
  description: string
  requirements?: JobRequirements
  startedTurn?: number
}

export interface JobApplication {
  id: string
  jobTitle: string
  company: string
  salary: number
  cost: StatEffect
  requirements: SkillRequirement[]
  daysPending: number
}
