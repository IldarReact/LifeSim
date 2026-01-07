import { createPartner, createPet } from './member-factory'

import { FAMILY_PRICES } from '@/core/lib/calculations/family-prices'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import type { Player, Country, FamilyMember } from '@/core/types'

export const processStartDating = (player: Player, countries: Record<string, Country>) => {
  const energy = player.personal.stats.energy
  const money = player.stats.money

  const economy = countries[player.countryId]
  const datingCost = economy
    ? getInflatedPrice(FAMILY_PRICES.DATING_SEARCH, economy, 'services')
    : FAMILY_PRICES.DATING_SEARCH

  if (energy < FAMILY_PRICES.DATING_ENERGY_COST || money < datingCost) return null

  return {
    money: datingCost,
    energy: FAMILY_PRICES.DATING_ENERGY_COST,
  }
}

export const processAcceptPartner = (
  player: Player,
  countries: Record<string, Country>,
  calculateMemberExpenses: (member: FamilyMember, countryId: string, modifier: number) => number,
) => {
  if (!player.personal.potentialPartner) return null

  const partner = player.personal.potentialPartner
  const economy = countries[player.countryId]

  const jobs = [
    { id: 'job_worker_start', title: 'Рабочий', income: 3000 },
    { id: 'job_indebted_start', title: 'Офисный работник', income: 18000 },
    { id: 'job_marketing', title: 'Digital Marketing Specialist', income: 22500 },
  ]
  const partnerJob = jobs.find((j) => j.title === partner.occupation) || jobs[0]

  const newMember = createPartner(partner, partnerJob)
  const costModifier = economy?.costOfLivingModifier || 1.0
  newMember.expenses = calculateMemberExpenses(newMember, player.countryId, costModifier)

  return {
    newMember,
    partnerName: partner.name,
  }
}

export const processTryForBaby = (player: Player) => {
  const hasPartner = player.personal.familyMembers.some(
    (m) => m.type === 'wife' || m.type === 'husband',
  )

  if (!hasPartner) return null

  return {
    pregnancy: {
      turnsLeft: 3,
      isTwins: Math.random() < 0.1,
      motherId: 'wife',
    },
  }
}

export const processAdoptPet = (
  player: Player,
  countries: Record<string, Country>,
  cost: number,
  name: string,
) => {
  if (player.stats.money < cost) return null

  const economy = countries[player.countryId]
  const petExpenses = economy
    ? getInflatedPrice(FAMILY_PRICES.PET_QUARTERLY_EXPENSES, economy, 'services')
    : FAMILY_PRICES.PET_QUARTERLY_EXPENSES

  const newPet = createPet(name, petExpenses)

  return {
    newPet,
    cost,
  }
}
