import type { StateCreator } from 'zustand'

import type { InflationNotification } from '@/core/lib/calculations/inflation-engine'
import type {
  GameState,
  PlayerState,
  Notification,
  JobApplication,
  FreelanceApplication,
} from '@/core/types'
import type { GameOffer, OfferType, OfferDetails } from '@/core/types/game-offers.types'
import type { SkillRequirement } from '@/core/types/skill.types'
import type { StatEffect } from '@/core/types/stats.types'

// Slice types for better organization
// Общий тип middleware для стора (devtools + persist)
export type GameStoreMiddlewares = [['zustand/devtools', never], ['zustand/persist', unknown]]

export interface GameSlice {
  turn: number
  year: number
  isProcessingTurn: boolean
  gameStatus: GameState['gameStatus']
  setupCountryId: string | null
  endReason: string | null
  activeActivity: string | null
  inflationNotification: InflationNotification | null

  // Actions
  setSetupCountry: (id: string) => void
  initializeGame: (countryId: string, archetype: string) => void
  resetGame: () => void
  setActiveActivity: (activity: string | null) => void
  nextTurn: () => void
  startSinglePlayer: () => void
  resolveCrisis: (actionType: string) => void
  clearInflationNotification: () => void
}

export interface PlayerSlice {
  player: PlayerState | null

  updatePlayer: (updater: (prev: PlayerState) => Partial<PlayerState>) => void

  // Actions
  applyStatChanges: (effect: StatEffect) => void
  performTransaction: (cost: StatEffect, options?: { requireFunds?: boolean; title?: string }) => boolean
}

export interface EducationSlice {
  // Actions
  studyCourse: (
    courseName: string,
    cost: number,
    costPerTurn: StatEffect,
    skillBonus: string,
    duration: number,
  ) => void
  applyToUniversity: (
    programName: string,
    cost: number,
    costPerTurn: StatEffect,
    skillBonus: string,
    duration: number,
  ) => void
}

export interface JobSlice {
  pendingApplications: JobApplication[]

  // Actions
  applyForJob: (
    jobTitle: string,
    company: string,
    salary: number,
    cost: StatEffect,
    requirements: SkillRequirement[],
  ) => void
  acceptJobOffer: (applicationId: string) => void
  quitJob: (jobId: string) => void

  // ✅ Multiplayer Job Actions
  acceptExternalJob: (jobTitle: string, company: string, salary: number, businessId: string) => void
}

export interface FreelanceSlice {
  pendingFreelanceApplications: FreelanceApplication[]

  // Actions
  applyForFreelance: (
    gigId: string,
    title: string,
    payment: number,
    cost: StatEffect,
    requirements: SkillRequirement[],
  ) => void
  acceptFreelanceGig: (applicationId: string) => void
  completeFreelanceGig: (gigId: string) => void
}

export interface FamilySlice {
  // Actions
  addFamilyMember: (
    name: string,
    type: 'wife' | 'husband' | 'child' | 'pet',
    age: number,
    income: number,
    expenses: number,
  ) => void
  removeFamilyMember: (id: string) => void
  updateLifeGoal: (goalId: string, progress: number) => void
  completeLifeGoal: (goalId: string) => void

  // Relationship Actions
  startDating: () => void
  acceptPartner: () => void
  rejectPartner: () => void
  tryForBaby: () => void
  adoptPet: (petType: 'dog' | 'cat' | 'hamster', name: string, cost: number) => void
  setMemberFoodPreference: (memberId: string, foodId: string) => void
  setMemberTransportPreference: (memberId: string, transportId: string) => void
}

export interface BusinessSlice {
  // Actions
  openBusiness: (
    name: string,
    type: import('@/core/types').BusinessType,
    description: string,
    totalCost: number,
    upfrontCost: number,
    creationCost: StatEffect,
    openingQuarters: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    maxEmployees: number,
    minEmployees: number,
    taxRate: number,
  ) => void
  hireEmployee: (businessId: string, candidate: import('@/core/types').EmployeeCandidate) => void
  fireEmployee: (businessId: string, employeeId: string) => void
  closeBusiness: (businessId: string) => void

  // New actions
  setPlayerManagerialRoles: (
    businessId: string,
    roles: import('@/core/types').EmployeeRole[],
  ) => void
  setPlayerOperationalRole: (
    businessId: string,
    role: import('@/core/types').EmployeeRole | null,
  ) => void
  freezeBusiness: (businessId: string) => void
  unfreezeBusiness: (businessId: string) => void
  changePrice: (businessId: string, newPrice: number) => void
  setQuantity: (businessId: string, newQuantity: number) => void
  openBranch: (sourceBusinessId: string) => void
  proposeAction: (
    businessId: string,
    type: import('@/core/types/business.types').ProposalType,
    payload: { newPrice?: number; newQuantity?: number; amount?: number },
  ) => void
  hireFamilyMember: (
    businessId: string,
    familyMemberId: string,
    role: import('@/core/types').EmployeeRole,
  ) => void

  // ✅ Player Employment in Business
  joinBusinessAsEmployee: (
    businessId: string,
    role: import('@/core/types').EmployeeRole,
    salary: number,
  ) => void
  leaveBusinessJob: (businessId: string) => void

  // ✅ Multiplayer Business Actions
  addPartnerToBusiness: (
    businessId: string,
    partnerId: string,
    partnerName: string,
    share: number,
    investment: number,
  ) => void
  addSharedBusiness: (business: import('@/core/types').Business) => void
  addEmployeeToBusiness: (
    businessId: string,
    employeeName: string,
    role: import('@/core/types').EmployeeRole,
    salary: number,
    playerId?: string,
  ) => void
}

export interface NotificationSlice {
  notifications: Notification[]
  pendingEventNotification: GameState['pendingEventNotification']

  // Actions
  pushNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'date'>) => void
  dismissNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
  dismissEventNotification: () => void
}

export interface MarketSlice {
  globalMarket: import('@/core/types').GlobalMarketCondition
  marketEvents: import('@/core/types').MarketEvent[]

  // Actions
  updateMarketCondition: (
    newValue: number,
    description: string,
    trend: 'rising' | 'falling' | 'stable',
  ) => void
  addMarketEvent: (event: import('@/core/types').MarketEvent) => void
}

export interface IdeaSlice {
  // Actions
  generateIdea: () => void
  developIdea: (ideaId: string, investment: number) => void
  launchBusinessFromIdea: (ideaId: string) => void
  discardIdea: (ideaId: string) => void
}

export interface ShopSlice {
  buyItem: (itemId: string) => void
  setLifestyle: (category: string, itemId: string | undefined) => void
  setPlayerHousing: (housingId: string) => void
}

export interface BankSlice {
  openDeposit: (amount: number, name?: string) => void
  takeLoan: (params: {
    name: string
    type: 'consumer_credit' | 'mortgage' | 'student_loan'
    amount: number
    interestRate: number
    quarterlyPayment: number
    termQuarters: number
  }) => void
}

export interface GameOffersSlice {
  offers: GameOffer[]

  // Actions
  sendOffer: (
    type: OfferType,
    toPlayerId: string,
    toPlayerName: string,
    details: OfferDetails,
    message?: string,
  ) => void

  acceptOffer: (offerId: string) => void
  rejectOffer: (offerId: string) => void
  cancelOffer: (offerId: string) => void
  cleanupExpiredOffers: () => void

  // Helpers
  getIncomingOffers: () => GameOffer[]
  getOutgoingOffers: () => GameOffer[]

  // Event Handlers
  onPartnershipAccepted: (
    event: import('@/core/types/events.types').PartnershipAcceptedEvent,
  ) => void
  onPartnershipUpdated: (event: import('@/core/types/events.types').PartnershipUpdatedEvent) => void
}

// Add these interfaces at the top of the file
export interface LocalPlayer {
  id: string
  name: string
  stats: {
    money: number
  }
  businesses: LocalBusiness[]
}

export interface LocalBusiness {
  id: string
  partnerBusinessId?: string
  // Add other business properties as needed
}

export interface LocalGameOffer {
  id: string
  type: string
  fromPlayerId: string
  fromPlayerName: string
  toPlayerId: string
  toPlayerName: string
  details: {
    businessName: string
    businessType: string
    businessDescription: string
    totalCost: number
    partnerInvestment: number
    partnerShare: number
    yourShare: number
    yourInvestment: number
    businessId: string
  }
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdTurn: number
  expiresInTurns: number
}

export interface LocalGameState {
  player: LocalPlayer
  offers: GameOffer[]
  turn: number
}

/**
 * Represents a business entity that can have multiple partners
 */
export interface BusinessWithPartners {
  id: string
  name: string
  type: string
  description: string
  totalInvestment: number
  valuation: number
  establishedDate: Date
  partners: Array<{
    id: string
    name?: string
    ownershipPercentage?: number
    joinedDate?: Date
  }>
  status: 'active' | 'inactive' | 'suspended' | 'closed'
  address?: {
    street: string
    city: string
    country: string
    postalCode: string
  }
  contact?: {
    email: string
    phone?: string
    website?: string
  }
  financials?: {
    revenue: number
    expenses: number
    profit: number
    lastUpdated: Date
  }
}

export interface MockState {
  get: () => LocalGameState
  set: (patch: any) => void
  on: (eventType: string, handler: (event: any) => void) => void
  state: () => LocalGameState
  getState: () => LocalGameState
  applyStatChanges?: (changes: any) => void
}

// Combined store type
export type GameStore = GameSlice &
  PlayerSlice &
  EducationSlice &
  JobSlice &
  FreelanceSlice &
  FamilySlice &
  BusinessSlice &
  NotificationSlice &
  MarketSlice &
  IdeaSlice &
  ShopSlice &
  BankSlice &
  GameOffersSlice &
  import('./activities/work/business/partnership-business-slice.types').PartnershipBusinessSlice & {
    countries: GameState['countries']
    globalEvents: GameState['globalEvents']
    history: GameState['history']
  }

// Удобный алиас для StateCreator со всеми middleware стора
export type GameStateCreator<TSlice> = StateCreator<GameStore, GameStoreMiddlewares, [], TSlice>
