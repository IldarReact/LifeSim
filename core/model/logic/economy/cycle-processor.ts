import type { EconomicCycle, EconomicPhase, EconomicEvent } from '@/core/types/economy.types'

/**
 * Configuration for Economic Cycles
 */
const CYCLE_CONFIG = {
  growth: { minDuration: 8, maxDuration: 16, baseModifier: 1.2 },
  peak: { minDuration: 2, maxDuration: 4, baseModifier: 1.5 },
  recession: { minDuration: 4, maxDuration: 8, baseModifier: 0.6 },
  recovery: { minDuration: 4, maxDuration: 6, baseModifier: 0.9 },
}

/**
 * Helper to get random duration for a phase
 */
function getRandomDuration(phase: EconomicPhase): number {
  const config = CYCLE_CONFIG[phase]
  return Math.floor(Math.random() * (config.maxDuration - config.minDuration + 1)) + config.minDuration
}

/**
 * Helper to get next phase
 */
function getNextPhase(currentPhase: EconomicPhase): EconomicPhase {
  switch (currentPhase) {
    case 'growth': return 'peak'
    case 'peak': return 'recession'
    case 'recession': return 'recovery'
    case 'recovery': return 'growth'
  }
}

/**
 * Helper to calculate market modifier based on phase and intensity
 */
function calculateMarketModifier(phase: EconomicPhase, intensity: number): number {
  const config = CYCLE_CONFIG[phase]
  // Random fluctuation +/- 10%
  const fluctuation = 0.9 + Math.random() * 0.2

  // Intensity makes peaks higher and recessions deeper
  let modifier = config.baseModifier
  if (phase === 'peak') modifier += intensity * 0.3
  if (phase === 'recession') modifier -= intensity * 0.2

  return Number((modifier * fluctuation).toFixed(2))
}

/**
 * Process Economic Cycle for a country
 * Should be called every turn
 */
export function processEconomicCycle(
  currentCycle: EconomicCycle | undefined,
  turn: number
): {
  cycle: EconomicCycle,
  newEvent: EconomicEvent | null
} {
  // Initialize if missing
  if (!currentCycle) {
    return {
      cycle: {
        phase: 'growth',
        durationLeft: getRandomDuration('growth'),
        intensity: 0.5,
        marketModifier: 1.0
      },
      newEvent: null
    }
  }

  let { phase, durationLeft, intensity } = currentCycle
  let newEvent: EconomicEvent | null = null

  // Decrease duration
  durationLeft -= 1

  // Check for phase change
  if (durationLeft <= 0) {
    const oldPhase = phase
    phase = getNextPhase(phase)
    durationLeft = getRandomDuration(phase)

    // Randomize intensity for new phase
    intensity = 0.3 + Math.random() * 0.7 // 0.3 - 1.0

    // Trigger Crisis Event when entering Recession
    if (phase === 'recession') {
      newEvent = {
        id: `crisis_${turn}_${Date.now()}`,
        type: 'crisis',
        title: 'Экономический Кризис',
        description: 'Экономика вошла в фазу рецессии. Спрос падает, безработица растет.',
        turn: turn,
        duration: durationLeft,
        effects: {
          inflationChange: 5 + Math.floor(Math.random() * 5), // +5-10% inflation
          unemploymentChange: 3 + Math.floor(Math.random() * 3), // +3-6% unemployment
          gdpGrowthChange: -5,
          salaryModifierChange: 0.9
        }
      }
    }

    // Trigger Boom Event when entering Peak
    if (phase === 'peak') {
      newEvent = {
        id: `boom_${turn}_${Date.now()}`,
        type: 'boom',
        title: 'Экономический Бум',
        description: 'Экономика на пике! Высокий спрос и рост зарплат.',
        turn: turn,
        duration: durationLeft,
        effects: {
          inflationChange: 2,
          unemploymentChange: -2,
          gdpGrowthChange: 4,
          salaryModifierChange: 1.1
        }
      }
    }
  }

  const marketModifier = calculateMarketModifier(phase, intensity)

  return {
    cycle: {
      phase,
      durationLeft,
      intensity,
      marketModifier
    },
    newEvent
  }
}
