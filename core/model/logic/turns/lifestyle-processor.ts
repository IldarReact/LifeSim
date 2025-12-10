import { calculateMemberExpenses } from '@/core/lib/lifestyle-expenses'
import { calculateLifestyleExpenses } from '@/core/lib/lifestyle-expenses'
import { getShopItemById } from '@/core/lib/data-loaders/shop-loader'
import traitsData from '@/shared/data/world/commons/human-traits.json'
import type { CountryEconomy } from '@/core/types'
import type { PlayerState, FamilyMember } from '@/core/types'

interface LifestyleResult {
  updatedFamilyMembers: FamilyMember[]
  lifestyleExpensesBreakdown: any
  lifestyleExpenses: number
  modifiers: {
    happiness: number
    health: number
    energy: number
    sanity: number
    intelligence: number
  }
}

export function processLifestyle(
  player: PlayerState,
  countries: Record<string, CountryEconomy>,
): LifestyleResult {
  const countryId = player.countryId
  const country = countries[countryId] || null

  const costModifier = (country && country.costOfLivingModifier) || 1.0

  const familyMembers = player.personal.familyMembers || []

  const updatedFamilyMembers = familyMembers.map((member: FamilyMember) => {
    const memberExpenses = calculateMemberExpenses(member, player.countryId, costModifier)
    return {
      ...member,
      expenses: memberExpenses,
    }
  })

  const playerWithUpdatedMembers = {
    ...player,
    personal: {
      ...player.personal,
      familyMembers: updatedFamilyMembers,
    },
  }

  const lifestyleExpensesBreakdown = calculateLifestyleExpenses(
    playerWithUpdatedMembers,
    costModifier,
  )
  const lifestyleExpenses = lifestyleExpensesBreakdown.total

  // Calculate modifiers from housing/food/transport/traits
  let happiness = 0
  let health = 0
  let energy = 0
  let sanity = 0
  let intelligence = 0

  // Housing
  if (player.housingId) {
    const housing = getShopItemById(player.housingId, player.countryId)
    if (housing && housing.effects) {
      if (housing.effects.happiness) happiness += housing.effects.happiness
      if (housing.effects.sanity) sanity += housing.effects.sanity
      if (housing.effects.health) health += housing.effects.health
    }
    
    // Overcrowding penalty
    if (housing && 'capacity' in housing && housing.capacity) {
      const familySize = 1 + (player.personal.familyMembers?.length || 0)
      const capacity = (housing.capacity as number) || 2
      
      if (familySize > capacity) {
        const overcrowdingPercent = ((familySize - capacity) / capacity) * 100
        // Formula: -1 per 10% overcrowding (rounded up)
        const penalty = Math.ceil(overcrowdingPercent / 10)
        
        happiness -= penalty
        sanity -= penalty
        intelligence -= Math.floor(penalty / 2)
      }
    }
  }

  // Food
  const foodId = player.activeLifestyle?.food
  if (foodId) {
    const food = getShopItemById(foodId, player.countryId)
    if (food && food.effects) {
      if (food.effects.happiness) happiness += food.effects.happiness
      if (food.effects.health) health += food.effects.health
      if (food.effects.energy) energy += food.effects.energy
      if (food.effects.sanity) sanity += food.effects.sanity
      if (food.effects.intelligence) intelligence += food.effects.intelligence
    }
  }

  // Transport
  if (player.activeLifestyle?.transport) {
    const transport = getShopItemById(player.activeLifestyle.transport, player.countryId)
    if (transport && transport.effects) {
      if (transport.effects.happiness) happiness += transport.effects.happiness
      if (transport.effects.health) health += transport.effects.health
      if (transport.effects.energy) energy += transport.effects.energy
      if (transport.effects.sanity) sanity += transport.effects.sanity
      if (transport.effects.intelligence) intelligence += transport.effects.intelligence
    }
  }

  // Traits effects
  if (player.traits) {
    player.traits.forEach((traitId: string) => {
      const trait = traitsData.find((t) => t.id === traitId)
      if (trait && trait.effects) {
        if (trait.effects.happiness) happiness += trait.effects.happiness
        if (trait.effects.health) health += trait.effects.health
        if (trait.effects.sanity) sanity += trait.effects.sanity
        if (trait.effects.intelligence) intelligence += trait.effects.intelligence
      }
    })
  }

  return {
    updatedFamilyMembers,
    lifestyleExpensesBreakdown,
    lifestyleExpenses,
    modifiers: {
      happiness,
      health,
      energy,
      sanity,
      intelligence,
    },
  }
}
