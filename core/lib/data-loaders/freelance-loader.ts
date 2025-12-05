// src/shared/data/loaders/freelance-loader.ts
import type { FreelanceGig } from '@/core/types/freelance.types'

import usFreelance from '@/shared/data/world/countries/us/freelance.json'
import geFreelance from '@/shared/data/world/countries/germany/freelance.json'
import brFreelance from '@/shared/data/world/countries/brazil/freelance.json'

function validateFreelance(item: unknown): item is FreelanceGig {
  const f = item as FreelanceGig
  return !!(
    f.id && typeof f.id === 'string' &&
    f.title && typeof f.title === 'string' &&
    typeof f.payment === 'number' &&
    f.cost && typeof f.cost === 'object' &&
    Array.isArray(f.requirements)
  )
}

function loadFreelance(data: unknown[], source: string): FreelanceGig[] {
  return data.filter(validateFreelance) as FreelanceGig[]
}

const COUNTRY_FREELANCE: Record<string, FreelanceGig[]> = {
  us: loadFreelance(usFreelance, 'us/freelance.json'),
  ge: loadFreelance(geFreelance, 'ge/freelance.json'),
  br: loadFreelance(brFreelance, 'br/freelance.json'),
}

export function getFreelanceGigs(countryId: string = 'us'): FreelanceGig[] {
  return COUNTRY_FREELANCE[countryId] ?? []
}

export function getFreelanceById(id: string, countryId: string = 'us'): FreelanceGig | undefined {
  return getFreelanceGigs(countryId).find(g => g.id === id)
}

export const ALL_FREELANCE = COUNTRY_FREELANCE.us