import { z } from 'zod'
import { StatEffectSchema, StatsSchema } from './base.schema'

export const BuffSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    effects: StatEffectSchema,
    duration: z.number().int(),
    description: z.string(),
  })
  .strict()

export const LifeGoalSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.enum(['dream', 'goal']),
    progress: z.number().finite(),
    target: z.number().finite(),
    reward: z.object({
      perTurnReward: StatEffectSchema,
      durationTurns: z.number().int(),
    }),
    isCompleted: z.boolean(),
    requirements: z
      .object({
        cash: z.number().finite().optional(),
        salary: z.number().finite().optional(),
        jobTitle: z.string().optional(),
        skillLevel: z.object({ skill: z.string(), level: z.number() }).optional(),
        hasCar: z.boolean().optional(),
        hasHouse: z.boolean().optional(),
        hasFamily: z.boolean().optional(),
      })
      .optional(),
  })
  .strict()

export const FamilyMemberSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['wife', 'husband', 'child', 'pet', 'parent']),
    age: z.number().finite(),
    relationLevel: z.number().finite().min(0).max(100),
    income: z.number().finite(),
    expenses: z.number().finite(),
    passiveEffects: StatEffectSchema,
    avatar: z.string().optional(),
    goals: z.array(LifeGoalSchema).optional(),
    employedInBusinessId: z.string().optional(),
    occupation: z.string().optional(),
    jobId: z.string().optional(),
    foodPreference: z.string().optional(),
    transportPreference: z.string().optional(),
    traits: z.array(z.string()).optional(),
    expensesBreakdown: z
      .object({
        food: z.number().finite(),
        housing: z.number().finite(),
        transport: z.number().finite(),
        credits: z.number().finite(),
        mortgage: z.number().finite(),
        other: z.number().finite(),
        total: z.number().finite(),
      })
      .optional(),
  })
  .strict()

export const PotentialPartnerSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    age: z.number().finite(),
    occupation: z.string(),
    income: z.number().finite(),
    avatar: z.string().optional(),
  })
  .strict()

export const PregnancySchema = z
  .object({
    turnsLeft: z.number().int().min(0),
    isTwins: z.boolean(),
    motherId: z.string(),
  })
  .strict()
