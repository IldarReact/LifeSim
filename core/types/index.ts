// Main types index - re-exports all types from modular files
// This file maintains backward compatibility while organizing types by domain

// Job types
export type { Job, JobApplication } from './job.types'

// Character types
export type { CharacterData, CharacterSkill, CharacterDebt } from './character.types'

// Business types
export type {
  EmployeeRole,
  EmployeeStars,
  EmployeeSkills,
  Employee,
  BusinessType,
  Business,
  BusinessInventory,
  BusinessPartner,
  BusinessProposal,
  BusinessChangeType,
  EmployeeCandidate,
  BusinessRoleTemplate,
  BusinessPosition,
  StaffImpactResult,
  PlayerBusinessImpact,
} from './business.types'

// Business ideas
export type { RiskLevel, IdeaStage, BusinessIdea, IdeaTemplate } from './idea.types'

// Game offers
export type { GameOffer, JobOffer, PartnershipOffer, ShareSaleOffer } from './game-offers.types'

// Market types
export type { GlobalMarketCondition, MarketEvent } from './market.types'

// Freelance types
export type { FreelanceGig, FreelanceApplication } from './freelance.types'

// Skill and education types
export type { SkillLevel, Skill, ActiveCourse, ActiveUniversity } from './skill.types'

// Economy types
export type {
  CountryArchetype,
  EconomicEventType,
  EconomicEvent,
  CountryEconomy,
  Country,
  GlobalEvent,
} from './economy.types'

// Finance types
export type {
  AssetType,
  DebtType,
  Asset,
  Debt,
  IncomeBreakdown,
  ExpensesBreakdown,
  TaxesBreakdown,
  QuarterlyReport,
} from './finance.types'

// Family and personal life types
export type {
  TimedBuff,
  PotentialPartner,
  Pregnancy,
  FamilyMember,
  LifeGoal,
  StatModifier,
  StatModifiers,
} from './family.types'

// Housing types
export type {
  HousingOwnershipType,
  HousingSubType,
  NearbyConstruction,
  HousingOption,
} from './housing.types'

// Shop types
export type { ShopCategory, ShopItem } from './shop.types'

// Rest types
export type { RestActivity } from './rest.types'

// Notification types
export type { Notification } from '@/core/types/notification.types'

// Personal life state
export type { PersonalLife } from './personal.types'

// Game state types
export type { GameStatus, GameOverReason, Player, HistoryEntry, GameState } from './game.types'

// Inflation
export type { InflationNotification } from '@/core/lib/calculations/inflation-engine'

// Stats core
export type { CoreStat, Stats, StatEffect } from './stats.types'

// Human traits
export type { HumanTrait } from './human-traits.types'
