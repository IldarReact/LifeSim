import type { Stats } from './stats.types'

export interface CharacterSkill {
  id: string
  name: string
  level: number
}

export interface CharacterDebt {
  id: string
  name: string
  type: string
  principalAmount: number
  remainingAmount: number
  interestRate: number
  quarterlyPayment: number
  termQuarters: number
  remainingQuarters: number
}

export interface CharacterData {
  id: string
  archetype: string
  name: string
  description: string
  startingMoney: number
  startingJobId: string
  startingSalary: number
  startingStats: Omit<Stats, 'money'>
  startingSkills?: CharacterSkill[]
  startingDebts?: CharacterDebt[]
  imageUrl: string
}
