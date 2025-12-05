/**
 * Example usage of the characters loader
 * This file demonstrates how to use the characters system
 */

import {
  getCharactersForCountry,
  getCharacterByArchetype,
  getCharacterById,
  getAvailableArchetypes
} from './characters-loader'

// Example 1: Get all characters for a country
export function exampleGetAllCharacters() {
  const usCharacters = getCharactersForCountry('us')
  console.log('US Characters:', usCharacters)

  const geCharacters = getCharactersForCountry('ge')
  console.log('Germany Characters:', geCharacters)

  const brCharacters = getCharactersForCountry('br')
  console.log('Brazil Characters:', brCharacters)
}

// Example 2: Get character by archetype
export function exampleGetByArchetype() {
  // Get investor for each country
  const usInvestor = getCharacterByArchetype('investor', 'us')
  console.log('US Investor:', usInvestor?.name, '-', usInvestor?.startingMoney)

  const geInvestor = getCharacterByArchetype('investor', 'ge')
  console.log('Germany Investor:', geInvestor?.name, '-', geInvestor?.startingMoney)

  const brInvestor = getCharacterByArchetype('investor', 'br')
  console.log('Brazil Investor:', brInvestor?.name, '-', brInvestor?.startingMoney)
}

// Example 3: Get character by ID
export function exampleGetById() {
  const character = getCharacterById('us_specialist', 'us')
  console.log('Character:', character?.name)
  console.log('Description:', character?.description)
  console.log('Starting Salary:', character?.startingSalary)
  console.log('Starting Stats:', character?.startingStats)
}

// Example 4: Get available archetypes
export function exampleGetArchetypes() {
  const usArchetypes = getAvailableArchetypes('us')
  console.log('Available archetypes in US:', usArchetypes)
  // Output: ['investor', 'specialist', 'entrepreneur', 'worker', 'indebted']
}

// Example 5: Use character data to initialize player
export function exampleInitializePlayer(archetype: string, countryId: string) {
  const characterData = getCharacterByArchetype(archetype, countryId)

  if (!characterData) {
    throw new Error(`Character not found: ${archetype} in ${countryId}`)
  }

  return {
    id: 'player_1',
    name: 'Player',
    archetype: characterData.archetype,
    countryId,
    age: 24,

    stats: {
      money: characterData.startingMoney,
      ...characterData.startingStats
    },

    quarterlySalary: characterData.startingSalary * 3,

    personal: {
      skills: characterData.startingSkills || [],
      // ... other personal data
    },

    debts: characterData.startingDebts || [],

    // ... other player data
  }
}
