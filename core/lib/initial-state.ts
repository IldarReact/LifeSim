import { createDebt } from "@/core/lib/calculations/debt-helpers"
import { createEmptyQuarterlyReport } from "@/core/lib/calculations/financial-helpers"
import { getCharacterByArchetype } from "@/core/lib/data-loaders/characters-loader"
import { getStartingJob, getJobById } from "@/core/lib/data-loaders/jobs-loader"
import type { CountryEconomy } from "@/core/types/economy.types"
import type { PlayerState } from "@/core/types/game.types"
import type { Job } from "@/core/types/job.types"
import type { Stats } from "@/core/types/stats.types"

// Deprecated: use getCountry(id) instead

export function createInitialPlayer(
  archetype: string,
  countryId: string
): PlayerState {
  const characterData = getCharacterByArchetype(archetype, countryId)

  if (!characterData) {
    throw new Error(`Character data not found for archetype "${archetype}" in country "${countryId}"`)
  }

  const baseStats: Stats = {
    money: characterData.startingMoney,
    happiness: characterData.startingStats.happiness,
    energy: characterData.startingStats.energy,
    health: characterData.startingStats.health,
    sanity: characterData.startingStats.sanity,
    intelligence: characterData.startingStats.intelligence,
  }

  const statEffect = {
    money: baseStats.money,
    happiness: baseStats.happiness,
    energy: baseStats.energy,
    health: baseStats.health,
    sanity: baseStats.sanity,
    intelligence: baseStats.intelligence,
  }

  // Получаем стартовую вакансию по ID из characters.json
  const startingJob = characterData.startingJobId
    ? getJobById(characterData.startingJobId, countryId)
    : getStartingJob(countryId, characterData.startingSkills)

  const initialJob: Job = startingJob || {
    // Fallback если вакансий нет (не должно случиться)
    id: `job_${Date.now()}`,
    title: characterData.name,
    company: "Start Corp",
    salary: characterData.startingSalary ?? 0,
    cost: {
      energy: -20
    },
    imageUrl: characterData.imageUrl,
    description: characterData.description,
  }

  const base: PlayerState = {
    id: `player_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name: "Player",
    countryId,
    age: 24,

    stats: { ...baseStats },

    multipliers: {
      happiness: -1,
    },
    happinessMultiplier: -1,

    assets: [],
    debts: [],
    creditScore: { value: 650 },

    personal: {
      stats: { ...statEffect },

      relations: {
        family: 50,
        friends: 50,
        colleagues: 50,
      },

      skills: characterData.startingSkills?.map(s => ({
        ...s,
        level: Math.min(5, Math.max(0, s.level)) as 0 | 1 | 2 | 3 | 4 | 5,
        progress: 0,
        lastPracticedTurn: -1
      })) ?? [],
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
    quarterlySalary: (characterData.startingSalary ?? 0) * 3,

    jobs: [],
    activeFreelanceGigs: [],
    businesses: [],
    businessIdeas: [],

    // Обязательные расходы (нельзя снизить до 0)
    activeLifestyle: {
      food: 'food_home', // Дефолт: готовит сам
      transport: 'tr_public' // Дефолт: общественный транспорт
    },

    // Текущее жильё (обязательно)
    housingId: 'housing_room', // Дефолт: комната в аренде

    // Начальные черты (для теста)
    traits: ['ambitious'],
  }

  const finalState = { ...base }

  // Add starting debts if any
  if (characterData.startingDebts && characterData.startingDebts.length > 0) {
    characterData.startingDebts.forEach(debt => {
      finalState.debts.push(createDebt({
        id: debt.id,
        name: debt.name,
        type: debt.type as any,
        principalAmount: debt.principalAmount,
        remainingAmount: debt.remainingAmount,
        interestRate: debt.interestRate,
        quarterlyPayment: debt.quarterlyPayment,
        termQuarters: debt.termQuarters,
        remainingQuarters: debt.remainingQuarters,
        startTurn: 0
      }))
    })
  }

  finalState.jobs = [initialJob]

  return finalState
}
