import type { CharacterData } from '@/core/types/character.types'

// Country imports
import usCharacters from '@/shared/data/world/countries/us/characters.json'
import geCharacters from '@/shared/data/world/countries/germany/characters.json'
import brCharacters from '@/shared/data/world/countries/brazil/characters.json'

const COUNTRY_CHARACTERS: Record<string, CharacterData[]> = {
  us: usCharacters as CharacterData[],
  ge: geCharacters as CharacterData[],
  br: brCharacters as CharacterData[],
}

/**
 * Get all characters for a specific country
 */
export function getCharactersForCountry(countryId: string): CharacterData[] {
  return COUNTRY_CHARACTERS[countryId] ?? COUNTRY_CHARACTERS.us
}

/**
 * Get character by archetype for a specific country
 */
export function getCharacterByArchetype(
  archetype: string,
  countryId: string = 'us'
): CharacterData | undefined {
  const characters = getCharactersForCountry(countryId)
  return characters.find(char => char.archetype === archetype)
}

/**
 * Get character by ID
 */
export function getCharacterById(
  id: string,
  countryId: string = 'us'
): CharacterData | undefined {
  const characters = getCharactersForCountry(countryId)
  return characters.find(char => char.id === id)
}
