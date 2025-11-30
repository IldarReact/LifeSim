import type { CountryEconomy } from "@/core/types/economy.types"
import type { PlayerState } from "@/core/types/game.types"
import type { CharacterArchetype, Job } from "@/core/types/job.types"
import { JOB_INFO } from "@/core/lib/jobsData"
import { createEmptyQuarterlyReport } from "@/core/lib/calculations/financial-helpers"
import { createDebt } from "@/core/lib/calculations/debt-helpers"
import type { Stats } from "@/core/types/stats.types"

export const INITIAL_COUNTRIES: Record<string, CountryEconomy> = {
  us: {
    id: "us",
    name: "United States",
    archetype: "rich_stable",
    gdpGrowth: 3,
    inflation: 2.5,
    keyRate: 3,
    interestRate: 3,
    unemployment: 4,
    taxRate: 30,
    corporateTaxRate: 21,
    salaryModifier: 1,
    costOfLivingModifier: 1,
    activeEvents: [],
  },
  de: {
    id: "de",
    name: "Germany",
    archetype: "rich_stable",
    gdpGrowth: 1.5,
    inflation: 2,
    keyRate: 2.5,
    interestRate: 2.5,
    unemployment: 3.5,
    taxRate: 40,
    corporateTaxRate: 30,
    salaryModifier: 0.9,
    costOfLivingModifier: 0.9,
    activeEvents: [],
  },
  br: {
    id: "br",
    name: "Brazil",
    archetype: "rich_resource",
    gdpGrowth: 10,
    inflation: 6,
    keyRate: 12,
    interestRate: 12,
    unemployment: 3,
    taxRate: 13,
    corporateTaxRate: 15,
    salaryModifier: 0.4,
    costOfLivingModifier: 0.5,
    activeEvents: [],
  },
}

export function createInitialPlayer(
  archetype: CharacterArchetype,
  countryId: string
): PlayerState {
  const jobInfo = JOB_INFO[archetype]

  const baseStats: Stats = {
    money: 0,
    happiness: 50,
    energy: 100,
    health: 100,
    sanity: 80,
    intelligence: 50,
  }

  const personalStats = {
    happiness: baseStats.happiness,
    energy: baseStats.energy,
    health: baseStats.health,
    sanity: baseStats.sanity,
    intelligence: baseStats.intelligence,
  }

  const initialJob: Job = {
    id: `job_${Date.now()}`,
    title: jobInfo.title,
    company: "Start Corp",
    salary: 0,
    cost: jobInfo.cost,
    satisfaction: jobInfo.satisfaction,
    imageUrl: jobInfo.imageUrl,
    description: jobInfo.description,
  }

  const base: PlayerState = {
    id: "player_1",
    name: "Player",
    archetype,
    countryId,
    age: 20,

    stats: { ...baseStats },

    multipliers: {
      happiness: 1,
    },
    happinessMultiplier: 1,

    assets: [],
    debts: [],

    personal: {
      stats: { ...personalStats },

      relations: {
        family: 50,
        friends: 50,
        colleagues: 50,
      },

      skills: [],
      activeCourses: [],
      activeUniversity: [],
      buffs: [],
      familyMembers: [],
      lifeGoals: [],

      isDating: false,
      potentialPartner: null,
      pregnancy: null,
    },

    quarterlyReport: createEmptyQuarterlyReport(),
    quarterlySalary: 0,

    jobs: [],
    activeFreelanceGigs: [],
    businesses: [],
  }

  let finalState = { ...base }

  const setMoney = (v: number) =>
    (finalState.stats.money = v)

  const setIntelligence = (v: number) =>
    (finalState.personal.stats.intelligence = v)

  switch (archetype) {
    case "investor":
      initialJob.salary = 2000
      setMoney(50000)
      setIntelligence(70)
      finalState.quarterlySalary = 2000 * 3
      break

    case "specialist":
      initialJob.salary = 4000
      setMoney(10000)
      setIntelligence(80)
      finalState.quarterlySalary = 4000 * 3
      break

    case "entrepreneur":
      initialJob.salary = 1000
      setMoney(5000)
      setIntelligence(60)
      finalState.quarterlySalary = 1000 * 3
      break

    case "worker":
      initialJob.salary = 2500
      setMoney(2000)
      setIntelligence(50)
      finalState.quarterlySalary = 2500 * 3
      break

    case "indebted":
      initialJob.salary = 2000
      setMoney(1000)
      setIntelligence(60)
      finalState.quarterlySalary = 2000 * 3

      finalState.debts.push(
        createDebt({
          id: "initial_debt",
          name: "Student Loan",
          type: "student_loan",
          principalAmount: 20000,
          remainingAmount: 20000,
          interestRate: 5,
          quarterlyPayment: 200 * 3,
          termQuarters: 40,
          remainingQuarters: 40,
          startTurn: 0,
        })
      )
      break
  }

  finalState.jobs = [initialJob]

  return finalState
}
