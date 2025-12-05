import type { Asset, Debt, QuarterlyReport } from './finance.types';
import type { PersonalLife } from './personal.types';
import type { Job } from './job.types';
import type { FreelanceGig } from './freelance.types';
import type { Business } from './business.types';
import type { BusinessIdea } from './idea.types';
import type { CountryEconomy, GlobalEvent } from './economy.types';
import type { Notification } from './notification.types';
import type { JobApplication } from './job.types';
import type { FreelanceApplication } from './freelance.types';
import { StatEffect, Stats } from './stats.types';

export type GameStatus = "menu" | "setup" | "select_country" | "select_character" | "playing" | "ended";

export type GameOverReason =
  | "DEATH"              // Health = 0
  | "MENTAL_BREAKDOWN"   // Sanity = 0
  | "DEGRADATION"        // Intelligence = 0
  | "DEPRESSION"         // Happiness = 0
  | "BANKRUPTCY";        // Финансовый крах

export interface PlayerState {
  id: string;
  name: string;
  countryId: string;
  age: number;

  assets: Asset[];
  debts: Debt[];
  personal: PersonalLife;
  quarterlyReport: QuarterlyReport;
  creditScore: { value: number } | number;

  quarterlySalary: number;

  stats: {
    money: number;
    happiness: number;
    energy: number;
    sanity: number;
    health: number;
    intelligence: number;
  };

  multipliers?: StatEffect;
  happinessMultiplier: number;

  // New Job System
  jobs: Job[];
  // Freelance System
  activeFreelanceGigs: FreelanceGig[];
  // Business System
  businesses: Business[];
  // Business Ideas System
  businessIdeas: BusinessIdea[];

  // Lifestyle System
  activeLifestyle: Partial<Record<string, string>>; // category -> itemId

  // Housing System
  housingId: string; // ID текущего жилья из housing.json

  // Traits System
  traits: string[];
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
  endReason: GameOverReason | null;
  // New fields
  notifications: Notification[];
  pendingApplications: JobApplication[];
  pendingFreelanceApplications: FreelanceApplication[];
}
