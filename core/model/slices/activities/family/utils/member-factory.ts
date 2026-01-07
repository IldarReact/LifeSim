import type { FamilyMember, PotentialPartner } from '@/core/types'

export const createNewMember = (
  name: string,
  type: FamilyMember['type'],
  age: number,
  income: number,
  expenses: number,
): FamilyMember => ({
  id: `family_${Date.now()}`,
  name,
  type,
  age,
  relationLevel: 50,
  income,
  expenses,
  passiveEffects: {
    happiness: type === 'pet' ? 2 : 5,
    sanity: type === 'pet' ? 3 : 1,
    health: 0,
  },
  foodPreference: type === 'pet' ? undefined : 'food_homemade',
})

export const createPet = (name: string, petExpenses: number): FamilyMember => ({
  id: `pet_${Date.now()}`,
  name,
  type: 'pet',
  age: 1,
  relationLevel: 80,
  income: 0,
  expenses: petExpenses,
  passiveEffects: {
    happiness: 3,
    sanity: 2,
    health: 0,
  },
})

export const createPartner = (
  partner: PotentialPartner,
  partnerJob: { id: string; title: string; income: number },
): FamilyMember => ({
  id: partner.id,
  name: partner.name,
  type: 'wife',
  age: partner.age,
  relationLevel: 50,
  income: partner.income,
  expenses: 0,
  passiveEffects: {
    happiness: 5,
    sanity: 2,
    health: 0,
  },
  foodPreference: 'food_homemade',
  transportPreference: 'transport_public',
  occupation: partner.occupation,
  jobId: partnerJob.id,
})
