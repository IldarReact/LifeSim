// Game state types
import type { CharacterArchetype } from './job.types';
import type { Asset, Debt, QuarterlyReport } from './finance.types';
import type { PersonalLife } from './personal.types';
import type { Job } from './job.types';
import type { FreelanceGig } from './freelance.types';
import type { Business } from './business.types';
import type { CountryEconomy, GlobalEvent } from './economy.types';
import type { Notification } from './notification.types';
import type { JobApplication } from './job.types';
import type { FreelanceApplication } from './freelance.types';

export type GameStatus = "menu" | "setup" | "select_country" | "select_character" | "playing" | "ended";

export interface PlayerState {
  id: string;
  name: string;
  archetype: CharacterArchetype;
  countryId: string;
  age: number;
  cash: number;
  assets: Asset[];
  debts: Debt[];
  personal: PersonalLife;
  quarterlyReport: QuarterlyReport;
  // Stats
  quarterlySalary: number; // Changed from monthlySalary
  happinessMultiplier: number;
  health: number;
  energy: number;
  // New Job System
  jobs: Job[];
  // Freelance System
  activeFreelanceGigs: FreelanceGig[];
  // Business System
  businesses: Business[];
}

export interface HistoryEntry {
  turn: number;
  year: number;
  netWorth: number;
  happiness: number;
  health: number;
  eventDescription?: string;
}

export interface GameState {
  turn: number;
  year: number;
  isProcessingTurn: boolean;
  gameStatus: GameStatus;
  globalEvents: GlobalEvent[];
  countries: Record<string, CountryEconomy>;
  player: PlayerState | null;
  history: HistoryEntry[];
  activeActivity: string | null;
  pendingEventNotification: GlobalEvent | null;
  setupCountryId: string | null;
  endReason: string | null;
  // New fields
  notifications: Notification[];
  pendingApplications: JobApplication[];
  pendingFreelanceApplications: FreelanceApplication[];
}
