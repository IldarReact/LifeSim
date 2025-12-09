import { z } from 'zod'

// --- Basic Types ---

export const StatEffectSchema = z.object({
  money: z.number().finite().optional(),
  happiness: z.number().finite().min(-100).max(100).optional(),
  energy: z.number().finite().min(-100).max(100).optional(),
  health: z.number().finite().min(-100).max(100).optional(),
  sanity: z.number().finite().min(-100).max(100).optional(),
  intelligence: z.number().finite().min(-100).max(100).optional(),
}).strict()

export const StatsSchema = z.object({
  money: z.number().finite().min(0),
  happiness: z.number().finite().min(0).max(100),
  energy: z.number().finite().min(0).max(100),
  sanity: z.number().finite().min(0).max(100),
  health: z.number().finite().min(0).max(100),
  intelligence: z.number().finite().min(0).max(100),
}).strict()

// --- Finance Types ---

export const AssetTypeSchema = z.enum(['housing', 'stock', 'business', 'deposit'])
export const DebtTypeSchema = z.enum(['mortgage', 'consumer_credit', 'student_loan'])

export const AssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: AssetTypeSchema,
  value: z.number().finite().min(0), // Deprecated
  currentValue: z.number().finite().min(0),
  purchasePrice: z.number().finite().min(0),
  unrealizedGain: z.number().finite(),
  income: z.number().finite().min(0),
  expenses: z.number().finite().min(0),
  risk: z.enum(['low', 'medium', 'high']),
  liquidity: z.enum(['low', 'medium', 'high']),
  stockSymbol: z.string().optional(),
  quantity: z.number().finite().min(0).optional(),
  lastSoldPrice: z.number().finite().min(0).optional(),
  soldAt: z.number().int().min(0).optional(),
}).strict()

export const DebtSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: DebtTypeSchema,
  principalAmount: z.number().finite().min(0),
  remainingAmount: z.number().finite().min(0),
  interestRate: z.number().finite().min(0).max(100),
  quarterlyPayment: z.number().finite().min(0),
  quarterlyPrincipal: z.number().finite().min(0),
  quarterlyInterest: z.number().finite().min(0),
  termQuarters: z.number().int().min(1),
  remainingQuarters: z.number().int().min(0),
  startTurn: z.number().int().min(0),
}).strict()

export const IncomeBreakdownSchema = z.object({
  salary: z.number().finite(),
  businessRevenue: z.number().finite(),
  familyIncome: z.number().finite(),
  assetIncome: z.number().finite(),
  capitalGains: z.number().finite(),
  total: z.number().finite(),
}).strict()

export const ExpensesBreakdownSchema = z.object({
  living: z.number().finite(),
  food: z.number().finite(),
  housing: z.number().finite(),
  transport: z.number().finite(),
  credits: z.number().finite(),
  mortgage: z.number().finite(),
  other: z.number().finite(),
  family: z.number().finite(), // Deprecated
  business: z.number().finite(),
  debtInterest: z.number().finite(),
  assetMaintenance: z.number().finite(),
  total: z.number().finite(),
}).strict()

export const TaxesBreakdownSchema = z.object({
  income: z.number().finite(),
  business: z.number().finite(),
  capital: z.number().finite(),
  property: z.number().finite(),
  total: z.number().finite(),
}).strict()

export const QuarterlyReportSchema = z.object({
  income: IncomeBreakdownSchema,
  expenses: ExpensesBreakdownSchema,
  taxes: TaxesBreakdownSchema,
  netProfit: z.number().finite(),
  warning: z.string().nullable(),
}).strict()

// --- Job & Business Types ---

export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  salary: z.number().finite().min(0),
  cost: StatEffectSchema,
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  requirements: z.object({
    education: z.string().optional(),
    skills: z.array(z.object({
      name: z.string(),
      level: z.number().int().min(0).max(5)
    })).optional(),
    experience: z.number().int().min(0).optional()
  }).optional()
}).strict()

// Simplified Business/Freelance schemas for now (can be expanded)
export const BusinessSchema = z.any() // TODO: Define strict schema
export const FreelanceGigSchema = z.any() // TODO: Define strict schema
export const BusinessIdeaSchema = z.any() // TODO: Define strict schema

// --- Personal Life Types ---

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  progress: z.number().finite().min(0).max(100),
  lastPracticedTurn: z.number().int().min(-1), // -1 означает "никогда не практиковался"
  isBeingStudied: z.boolean().optional(),
  isBeingUsedAtWork: z.boolean().optional(),
}).strict()

export const ActiveCourseSchema = z.object({
  id: z.string(),
  courseName: z.string(),
  skillName: z.string(),
  skillBonus: z.number().finite().min(0),
  totalDuration: z.number().int().min(1),
  remainingDuration: z.number().int().min(0),
  costPerTurn: StatEffectSchema,
  startedTurn: z.number().int().min(0),
}).strict()

export const ActiveUniversitySchema = z.object({
  id: z.string(),
  programName: z.string(),
  skillName: z.string(),
  skillBonus: z.number().finite().min(0),
  totalDuration: z.number().int().min(1),
  remainingDuration: z.number().int().min(0),
  costPerTurn: StatEffectSchema,
  startedTurn: z.number().int().min(0),
}).strict()

export const PersonalLifeSchema = z.object({
  stats: StatsSchema,
  relations: z.object({
    family: z.number().finite().min(0).max(100),
    friends: z.number().finite().min(0).max(100),
    colleagues: z.number().finite().min(0).max(100),
  }).strict(),
  skills: z.array(SkillSchema),
  activeCourses: z.array(ActiveCourseSchema),
  activeUniversity: z.array(ActiveUniversitySchema),
  buffs: z.array(z.any()), // TODO: Define BuffSchema
  familyMembers: z.array(z.any()), // TODO: Define FamilyMemberSchema
  lifeGoals: z.array(z.any()), // TODO: Define LifeGoalSchema
  isDating: z.boolean(),
  potentialPartner: z.any().nullable(), // TODO: Define PotentialPartnerSchema
  pregnancy: z.any().nullable(), // TODO: Define PregnancySchema
}).strict()

// --- Player State ---

export const PlayerStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  countryId: z.string(),
  age: z.number().int().min(0),

  assets: z.array(AssetSchema),
  debts: z.array(DebtSchema),
  personal: PersonalLifeSchema,
  quarterlyReport: QuarterlyReportSchema,

  quarterlySalary: z.number().finite().min(0),

  stats: z.object({
    money: z.number().finite().min(0),
    happiness: z.number().finite().min(0).max(100),
    energy: z.number().finite().min(0).max(100),
    sanity: z.number().finite().min(0).max(100),
    health: z.number().finite().min(0).max(100),
    intelligence: z.number().finite().min(0).max(100),
  }).strict(),

  multipliers: StatEffectSchema.optional(),
  happinessMultiplier: z.number().finite().min(0),

  jobs: z.array(JobSchema),
  activeFreelanceGigs: z.array(FreelanceGigSchema),
  businesses: z.array(BusinessSchema),
  businessIdeas: z.array(BusinessIdeaSchema),

  activeLifestyle: z.record(z.string(), z.string().optional()), // category -> itemId

  foodPreference: z.string().optional(),
  housingPreference: z.string().optional(),
}).passthrough() // Временно разрешаем дополнительные поля

// --- Game State ---

const CountryEconomySchema = z.object({
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
  activeEvents: z.array(z.any()),
  inflationHistory: z.array(z.number()).optional(),
  baseYear: z.number().optional(),
}).passthrough()

export const GameStateSchema = z.object({
  turn: z.number().int().min(0),
  year: z.number().int().min(0),
  isProcessingTurn: z.boolean(),
  gameStatus: z.enum(["menu", "setup", "select_country", "select_character", "playing", "ended"]),
  globalEvents: z.array(z.any()), // TODO: Define GlobalEventSchema
  countries: z.record(z.string(), CountryEconomySchema),
  player: PlayerStateSchema.nullable(),
  history: z.array(z.object({
    turn: z.number().int().min(0),
    year: z.number().int().min(0),
    netWorth: z.number().finite(),
    happiness: z.number().finite().min(0).max(100),
    health: z.number().finite().min(0).max(100),
    eventDescription: z.string().optional(),
  })),
  activeActivity: z.string().nullable(),
  pendingEventNotification: z.any().nullable(),
  setupCountryId: z.string().nullable(),
  endReason: z.enum(["DEATH", "MENTAL_BREAKDOWN", "DEGRADATION", "DEPRESSION", "BANKRUPTCY"]).nullable(),
  notifications: z.array(z.any()),
  pendingApplications: z.array(z.any()),
  pendingFreelanceApplications: z.array(z.any()),
}).passthrough() // Временно разрешаем дополнительные поля для отладки

// Export inferred types
export type PlayerState = z.infer<typeof PlayerStateSchema>
export type GameState = z.infer<typeof GameStateSchema>
