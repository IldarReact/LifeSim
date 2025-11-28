// Main types index - re-exports all types from modular files
// This file maintains backward compatibility while organizing types by domain

// Job types
export type { CharacterArchetype, JobInfo, Job, JobApplication } from './job.types';

// Business types
export type {
  EmployeeRole,
  EmployeeLevel,
  EmployeeSkills,
  Employee,
  BusinessType,
  Business,
  EmployeeCandidate
} from './business.types';

// Freelance types
export type { FreelanceGig, FreelanceApplication } from './freelance.types';

// Skill and education types
export type { SkillLevel, Skill, ActiveCourse, ActiveUniversity } from './skill.types';

// Economy types
export type {
  CountryArchetype,
  EconomicEventType,
  EconomicEvent,
  CountryEconomy,
  Country,
  GlobalEvent
} from './economy.types';

// Finance types
export type {
  AssetType,
  DebtType,
  Asset,
  Debt,
  QuarterlyReport
} from './finance.types';

// Family and personal life types
export type {
  TimedBuff,
  PotentialPartner,
  Pregnancy,
  FamilyMember,
  LifeGoal,
  StatModifier,
  StatModifiers
} from './family.types';

// Notification types
export type { Notification } from './notification.types';

// Personal life state
export type { PersonalLife } from './personal.types';

// Game state types
export type {
  GameStatus,
  PlayerState,
  HistoryEntry,
  GameState
} from './game.types';
