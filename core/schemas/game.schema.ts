import { z } from 'zod'
import {
  StatEffectSchema,
  StatsSchema,
  SkillLevelSchema,
  SkillRequirementSchema,
} from './base.schema'
import { BusinessSchema, FreelanceGigSchema, BusinessIdeaSchema } from './business.schema'
import {
  BuffSchema,
  FamilyMemberSchema,
  LifeGoalSchema,
  PotentialPartnerSchema,
  PregnancySchema,
} from './family.schema'
import { AssetSchema, DebtSchema, QuarterlyReportSchema } from './finance.schema'
import { CountryEconomySchema, GlobalEventSchema } from './economy.schema'

// Re-export for convenience if needed elsewhere
export * from './base.schema'
export * from './business.schema'
export * from './family.schema'
export * from './economy.schema'
export * from './finance.schema'

// --- Skill Types ---

export const SkillSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    level: SkillLevelSchema,
    progress: z.number().finite().min(0).max(100),
    lastPracticedTurn: z.number().int().min(0),
    isBeingStudied: z.boolean().optional(),
    isBeingUsedAtWork: z.boolean().optional(),
  })
  .strict()

export const ActiveCourseSchema = z
  .object({
    id: z.string(),
    courseName: z.string(),
    skillName: z.string(),
    skillBonus: z.number().finite(),
    totalDuration: z.number().int().min(1),
    remainingDuration: z.number().int().min(0),
    costPerTurn: StatEffectSchema,
    startedTurn: z.number().int().min(0),
  })
  .strict()

export const ActiveUniversitySchema = z
  .object({
    id: z.string(),
    programName: z.string(),
    skillName: z.string(),
    skillBonus: z.number().finite(),
    totalDuration: z.number().int().min(1),
    remainingDuration: z.number().int().min(0),
    costPerTurn: StatEffectSchema,
    startedTurn: z.number().int().min(0),
  })
  .strict()

// --- Job Types ---

export const JobRequirementsSchema = z
  .object({
    education: z.string().optional(),
    skills: z.array(z.object({ name: z.string(), level: z.number() })).optional(),
    experience: z.number().optional(),
  })
  .strict()

export const JobSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    company: z.string(),
    salary: z.number().finite().min(0),
    cost: StatEffectSchema,
    imageUrl: z.string(),
    description: z.string(),
    requirements: JobRequirementsSchema.optional(),
  })
  .strict()

// --- Player Types ---

export const PersonalLifeSchema = z
  .object({
    stats: StatsSchema,
    relations: z
      .object({
        family: z.number().finite().min(0).max(100),
        friends: z.number().finite().min(0).max(100),
        colleagues: z.number().finite().min(0).max(100),
      })
      .strict(),
    skills: z.array(SkillSchema),
    activeCourses: z.array(ActiveCourseSchema),
    activeUniversity: z.array(ActiveUniversitySchema),
    buffs: z.array(BuffSchema),
    familyMembers: z.array(FamilyMemberSchema),
    lifeGoals: z.array(LifeGoalSchema),
    isDating: z.boolean(),
    potentialPartner: PotentialPartnerSchema.nullable(),
    pregnancy: PregnancySchema.nullable(),
  })
  .strict()

export const PlayerSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    age: z.number().int().min(0),
    avatar: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']),
    currentJob: JobSchema.nullable(),
    residenceCountryId: z.string(),
    personalLife: PersonalLifeSchema,
    businesses: z.array(BusinessSchema),
    freelanceGigs: z.array(FreelanceGigSchema),
    businessIdeas: z.array(BusinessIdeaSchema),
    // Missing fields from Player interface
    assets: z.array(AssetSchema),
    debts: z.array(DebtSchema),
    quarterlyReport: QuarterlyReportSchema,
    creditScore: z.union([z.object({ value: z.number() }), z.number()]),
    quarterlySalary: z.number().finite(),
    stats: StatsSchema,
    multipliers: StatEffectSchema.optional(),
    happinessMultiplier: z.number().finite(),
    activeLifestyle: z.record(z.string(), z.string()),
    housingId: z.string(),
    traits: z.array(z.string()),
  })
  .strict()

// --- System Types ---

export const NotificationSchema = z
  .object({
    id: z.string(),
    type: z.enum([
      'job_offer',
      'job_rejection',
      'info',
      'promotion',
      'success',
      'warning',
      'error',
    ]),
    title: z.string(),
    message: z.string(),
    isRead: z.boolean(),
    date: z.string().optional(),
    data: z.unknown().optional(),
  })
  .strict()

export const PendingApplicationSchema = z
  .object({
    id: z.string(),
    jobTitle: z.string(),
    company: z.string(),
    salary: z.number().finite(),
    cost: StatEffectSchema,
    requirements: z.array(SkillRequirementSchema),
    daysPending: z.number().int(),
  })
  .strict()

export const PendingFreelanceApplicationSchema = z
  .object({
    id: z.string(),
    gigId: z.string(),
    title: z.string(),
    payment: z.number().finite(),
    cost: StatEffectSchema,
    requirements: z.array(SkillRequirementSchema),
  })
  .strict()

// --- Game State ---

export const GameStateSchema = z
  .object({
    turn: z.number().int().min(0),
    year: z.number().int().min(0),
    isProcessingTurn: z.boolean(),
    gameStatus: z.enum([
      'menu',
      'setup',
      'select_country',
      'select_character',
      'playing',
      'year_report',
      'ended',
    ]),
    globalEvents: z.array(GlobalEventSchema),
    countries: z.record(z.string(), CountryEconomySchema),
    player: PlayerSchema.nullable(),
    history: z.array(
      z.object({
        turn: z.number().int().min(0),
        year: z.number().int().min(0),
        netWorth: z.number().finite(),
        happiness: z.number().finite().min(0).max(100),
        health: z.number().finite().min(0).max(100),
        eventDescription: z.string().optional(),
      }),
    ),
    activeActivity: z.string().nullable(),
    pendingEventNotification: GlobalEventSchema.nullable(),
    setupCountryId: z.string().nullable(),
    endReason: z
      .enum(['DEATH', 'MENTAL_BREAKDOWN', 'DEGRADATION', 'DEPRESSION', 'BANKRUPTCY'])
      .nullable(),
    notifications: z.array(NotificationSchema),
    pendingApplications: z.array(PendingApplicationSchema),
    pendingFreelanceApplications: z.array(PendingFreelanceApplicationSchema),
  })
  .strict()

export type GameState = z.infer<typeof GameStateSchema>
export type Player = z.infer<typeof PlayerSchema>
