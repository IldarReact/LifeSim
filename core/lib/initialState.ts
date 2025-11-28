import type { CountryEconomy, PlayerState, CharacterArchetype, Job } from "@/core/types"
import { JOB_INFO } from "@/core/lib/jobsData"

export const INITIAL_COUNTRIES: Record<string, CountryEconomy> = {
  "us": {
    id: "us",
    name: "United States",
    archetype: "rich_stable",
    gdpGrowth: 3.0,
    inflation: 2.5,
    keyRate: 3.0,
    interestRate: 3.0,
    unemployment: 4.0,
    taxRate: 30,
    salaryModifier: 1.0,
    costOfLivingModifier: 1.0,
    activeEvents: []
  },
  "de": {
    id: "de",
    name: "Germany",
    archetype: "rich_stable",
    gdpGrowth: 1.5,
    inflation: 2.0,
    keyRate: 2.5,
    interestRate: 2.5,
    unemployment: 3.5,
    taxRate: 40,
    salaryModifier: 0.9,
    costOfLivingModifier: 0.9,
    activeEvents: []
  },
  "br": {
    id: "br",
    name: "Brazil",
    archetype: "rich_resource",
    gdpGrowth: 10.0,
    inflation: 6.0,
    keyRate: 12.0,
    interestRate: 12.0,
    unemployment: 3.0,
    taxRate: 13,
    salaryModifier: 0.4,
    costOfLivingModifier: 0.5,
    activeEvents: []
  }
}

export function createInitialPlayer(archetype: CharacterArchetype, countryId: string): PlayerState {
  const jobInfo = JOB_INFO[archetype]

  const initialJob: Job = {
    id: `job_${Date.now()}`,
    title: jobInfo.title,
    company: "Start Corp", // Placeholder
    salary: 0, // Will be set in switch
    energyCost: jobInfo.energyCost,
    satisfaction: jobInfo.satisfaction,
    mentalHealthImpact: jobInfo.mentalHealthImpact,
    physicalHealthImpact: jobInfo.physicalHealthImpact,
    imageUrl: jobInfo.imageUrl,
    description: jobInfo.description
  }

  const base: PlayerState = {
    id: "player_1",
    name: "Player",
    archetype,
    countryId,
    age: 20,
    cash: 0,
    assets: [],
    debts: [],
    personal: {
      happiness: 50,
      health: 100,
      energy: 100,
      intelligence: 50, // Default
      sanity: 80,
      relations: { family: 50, friends: 50, colleagues: 50 },
      skills: [],
      activeCourses: [],
      activeUniversity: [],
      buffs: [],
      familyMembers: [],
      lifeGoals: [
        {
          id: 'goal_1',
          title: 'Финансовая независимость',
          description: 'Накопить $100,000',
          type: 'goal',
          progress: 0,
          target: 100000,
          reward: { happinessPerTurn: 2, sanityPerTurn: 1, durationTurns: 20 },
          isCompleted: false,
          requirements: { cash: 100000 }
        },
        {
          id: 'dream_1',
          title: 'Дом мечты',
          description: 'Купить собственный дом',
          type: 'dream',
          progress: 0,
          target: 1,
          reward: { happinessPerTurn: 5, sanityPerTurn: 2, durationTurns: 40 },
          isCompleted: false,
          requirements: { hasHouse: true }
        }
      ],
      isDating: false,
      potentialPartner: null,
      pregnancy: null
    },
    quarterlyReport: {
      income: 0,
      taxes: 0,
      expenses: 0,
      profit: 0,
      warning: null
    },
    quarterlySalary: 0,
    happinessMultiplier: 1.0,
    health: 100,
    energy: 100,
    jobs: [],
    activeFreelanceGigs: [],
    businesses: []
  }

  let finalState = { ...base }

  switch (archetype) {
    case "investor":
      initialJob.salary = 2000 * 3
      finalState = {
        ...base,
        cash: 50000,
        quarterlySalary: 2000 * 3,
        personal: {
          ...base.personal, intelligence: 70, skills: [
            { id: 'fin_1', name: 'Инвестиции', level: 2, progress: 40, lastPracticedTurn: 0 },
            { id: 'eng_inv', name: 'English', level: 3, progress: 30, lastPracticedTurn: 0 }
          ],
          familyMembers: [
            {
              id: 'wife_inv',
              name: 'Виктория',
              type: 'wife',
              age: 24,
              relationLevel: 80,
              income: 1500 * 3,
              expenses: 2000 * 3,
              happinessMod: 5,
              sanityMod: 2,
              healthMod: 0,
              goals: [
                {
                  id: 'wife_goal_1',
                  title: 'Отпуск на Мальдивах',
                  description: 'Хочет поехать в дорогой отпуск',
                  type: 'dream',
                  progress: 0,
                  target: 5000,
                  reward: { happinessPerTurn: 0, sanityPerTurn: 0, durationTurns: 0 }, // Instant reward handled elsewhere
                  isCompleted: false,
                  requirements: { cash: 5000 }
                }
              ]
            }
          ]
        }
      }
      break
    case "specialist":
      initialJob.salary = 4000 * 3
      finalState = {
        ...base,
        cash: 10000,
        quarterlySalary: 4000 * 3,
        personal: {
          ...base.personal, intelligence: 80, skills: [
            { id: 'prog_1', name: 'Программирование', level: 2, progress: 45, lastPracticedTurn: 0 },
            { id: 'eng_spec', name: 'English', level: 4, progress: 20, lastPracticedTurn: 0 }
          ],
          familyMembers: [
            { id: 'pet_spec', name: 'Пиксель', type: 'pet', age: 2, relationLevel: 90, income: 0, expenses: 100 * 3, happinessMod: 3, sanityMod: 5, healthMod: 0 }
          ]
        }
      }
      break
    case "entrepreneur":
      initialJob.salary = 1000 * 3
      finalState = {
        ...base,
        cash: 5000,
        quarterlySalary: 1000 * 3,
        personal: {
          ...base.personal, intelligence: 75, skills: [
            { id: 'man_1', name: 'Менеджмент', level: 2, progress: 40, lastPracticedTurn: 0 },
            { id: 'eng_ent', name: 'English', level: 2, progress: 60, lastPracticedTurn: 0 }
          ],
          familyMembers: [
            { id: 'wife_ent', name: 'Елена', type: 'wife', age: 25, relationLevel: 70, income: 1000 * 3, expenses: 1500 * 3, happinessMod: 4, sanityMod: 1, healthMod: 0 },
            { id: 'child_ent', name: 'Макс', type: 'child', age: 3, relationLevel: 90, income: 0, expenses: 500 * 3, happinessMod: 10, sanityMod: -2, healthMod: 0 }
          ]
        }
      }
      break
    case "worker":
      initialJob.salary = 2500 * 3
      finalState = {
        ...base,
        cash: 2000,
        quarterlySalary: 2500 * 3,
        personal: {
          ...base.personal, intelligence: 50, skills: [
            { id: 'eng_work', name: 'English', level: 1, progress: 50, lastPracticedTurn: 0 }
          ],
          familyMembers: [
            { id: 'wife_work', name: 'Ольга', type: 'wife', age: 22, relationLevel: 60, income: 800 * 3, expenses: 1000 * 3, happinessMod: 3, sanityMod: 1, healthMod: 0 },
            { id: 'child_work_1', name: 'Аня', type: 'child', age: 4, relationLevel: 80, income: 0, expenses: 400 * 3, happinessMod: 8, sanityMod: -1, healthMod: 0 },
            { id: 'child_work_2', name: 'Ваня', type: 'child', age: 1, relationLevel: 90, income: 0, expenses: 400 * 3, happinessMod: 8, sanityMod: -2, healthMod: 0 }
          ]
        }
      }
      break
    case "indebted":
      initialJob.salary = 2000 * 3
      finalState = {
        ...base,
        cash: 1000,
        quarterlySalary: 2000 * 3,
        personal: {
          ...base.personal, intelligence: 60, skills: [
            { id: 'fin_2', name: 'Фин. грамотность', level: 1, progress: 20, lastPracticedTurn: 0 },
            { id: 'eng_debt', name: 'English', level: 2, progress: 30, lastPracticedTurn: 0 }
          ],
          familyMembers: [] // Alone
        },
        debts: [{
          id: "initial_debt",
          name: "Student Loan",
          type: "student_loan",
          amount: 20000,
          interestRate: 5,
          quarterlyPayment: 200 * 3,
          termMonths: 120
        }]
      }
      break
  }

  finalState.jobs = [initialJob]
  return finalState
}
