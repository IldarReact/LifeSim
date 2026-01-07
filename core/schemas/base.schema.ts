import { z } from 'zod'

export const StatEffectSchema = z
  .object({
    money: z.number().finite().optional(),
    happiness: z.number().finite().optional(),
    energy: z.number().finite().optional(),
    health: z.number().finite().optional(),
    sanity: z.number().finite().optional(),
    intelligence: z.number().finite().optional(),
  })
  .strict()

export const StatsSchema = z
  .object({
    money: z.number().finite(),
    happiness: z.number().finite().min(0).max(100),
    energy: z.number().finite().min(0).max(100),
    health: z.number().finite().min(0).max(100),
    sanity: z.number().finite().min(0).max(100),
    intelligence: z.number().finite().min(0).max(100),
  })
  .strict()

export const SkillLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
])

export const SkillRequirementSchema = z
  .object({
    skillId: z.string(),
    minLevel: SkillLevelSchema,
  })
  .strict()
