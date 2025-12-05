// src/shared/data/loaders/npcs-loader.ts
import type { FamilyMember } from '@/core/types/family.types'

import brNpcs from '@/shared/data/world/countries/brazil/npcs.json'
import geNpcs from '@/shared/data/world/countries/germany/npcs.json'
import usNpcs from '@/shared/data/world/countries/us/npcs.json'

const COUNTRY_NPCS: Record<string, FamilyMember[]> = {
  br: brNpcs as FamilyMember[],
  ge: geNpcs as FamilyMember[],
  us: usNpcs as FamilyMember[],
}

export function getAllNPCs(countryId: string): FamilyMember[] {
  return COUNTRY_NPCS[countryId] ?? []
}

export function getNPCsByType(countryId: string, type: FamilyMember['type']): FamilyMember[] {
  return getAllNPCs(countryId).filter(npc => npc.type === type)
}

export function getNPCById(id: string, countryId: string): FamilyMember | undefined {
  return getAllNPCs(countryId).find(npc => npc.id === id)
}

// Удобные хелперы
export function getFamily(countryId: string): FamilyMember[] {
  return getAllNPCs(countryId).filter(n => ['wife', 'husband', 'child', 'parent'].includes(n.type))
}

// export function getFriends(countryId: string): FamilyMember[] {
//   return getNPCsByType(countryId, 'friend')
// }

export function getPets(countryId: string): FamilyMember[] {
  return getNPCsByType(countryId, 'pet')
}