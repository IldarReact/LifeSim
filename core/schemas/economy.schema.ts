import { z } from 'zod'

export const EconomicEventSchema = z
  .object({
    id: z.string(),
    type: z.enum(['crisis', 'boom', 'recession', 'inflation_spike', 'rate_hike', 'rate_cut']),
    title: z.string(),
    description: z.string(),
    turn: z.number().int(),
    duration: z.number().int(),
    effects: z.object({
      inflationChange: z.number().optional(),
      keyRateChange: z.number().optional(),
      gdpGrowthChange: z.number().optional(),
      unemploymentChange: z.number().optional(),
      salaryModifierChange: z.number().optional(),
    }),
  })
  .strict()

export const CountryEconomySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    archetype: z.string(),
    gdpGrowth: z.number(),
    inflation: z.number(),
    stockMarketInflation: z.number(),
    keyRate: z.number(),
    interestRate: z.number(),
    unemployment: z.number(),
    taxRate: z.number(),
    corporateTaxRate: z.number(),
    salaryModifier: z.number(),
    costOfLivingModifier: z.number(),
    baseSalaries: z.record(z.string(), z.number()).optional(),
    imageUrl: z.string().optional(),
    activeEvents: z.array(EconomicEventSchema),
    inflationHistory: z.array(z.number()).optional(),
    baseYear: z.number().optional(),
  })
  .passthrough()

export const GlobalEventSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    impact: z.object({
      gdp: z.number().optional(),
      inflation: z.number().optional(),
      market: z.number().optional(),
    }),
  })
  .strict()
