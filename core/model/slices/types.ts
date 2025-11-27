import type { 
  GameState, 
  PlayerState, 
  Notification, 
  JobApplication,
  FreelanceApplication,
  CharacterArchetype,
  SkillLevel
} from '@/core/types'

// Slice types for better organization
export interface GameSlice {
  turn: number
  year: number
  isProcessingTurn: boolean
  gameStatus: GameState['gameStatus']
  setupCountryId: string | null
  endReason: string | null
  activeActivity: string | null
  
  // Actions
  setSetupCountry: (id: string) => void
  initializeGame: (countryId: string, archetype: CharacterArchetype) => void
  resetGame: () => void
  setActiveActivity: (activity: string | null) => void
  nextTurn: () => void
}

export interface PlayerSlice {
  player: PlayerState | null
  
  // Actions
  spendEnergy: (amount: number) => void
  applyStatChanges: (changes: {
    happiness?: number
    health?: number
    energy?: number
    sanity?: number
    intelligence?: number
    cash?: number
  }) => void
}

export interface EducationSlice {
  // Actions
  studyCourse: (
    courseName: string, 
    cost: number, 
    energyCost: number, 
    skillBonus: string, 
    duration: number
  ) => void
  applyToUniversity: (
    programName: string, 
    cost: number, 
    energyCost: number, 
    skillBonus: string, 
    duration: number
  ) => void
}

export interface JobSlice {
  pendingApplications: JobApplication[]
  
  // Actions
  applyForJob: (
    jobTitle: string, 
    company: string, 
    salary: number, 
    energyCost: number, 
    requirements: string[]
  ) => void
  acceptJobOffer: (applicationId: string) => void
  quitJob: (jobId: string) => void
}

export interface FreelanceSlice {
  pendingFreelanceApplications: FreelanceApplication[]
  
  // Actions
  applyForFreelance: (
    gigId: string,
    title: string,
    payment: number,
    energyCost: number,
    requirements: Array<{ skill: string; level: SkillLevel }>
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
    expenses: number
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
}

export interface BusinessSlice {
  // Actions
  openBusiness: (
    name: string,
    type: import('@/core/types').BusinessType,
    description: string,
    initialCost: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    maxEmployees: number,
    energyCostPerTurn: number,
    stressImpact: number
  ) => void
  hireEmployee: (businessId: string, candidate: import('@/core/types').EmployeeCandidate) => void
  fireEmployee: (businessId: string, employeeId: string) => void
  closeBusiness: (businessId: string) => void
}

export interface NotificationSlice {
  notifications: Notification[]
  pendingEventNotification: GameState['pendingEventNotification']
  
  // Actions
  dismissNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
  dismissEventNotification: () => void
}

// Combined store type
export type GameStore = GameSlice & 
  PlayerSlice & 
  EducationSlice & 
  JobSlice & 
  FreelanceSlice &
  FamilySlice &
  BusinessSlice &
  NotificationSlice & {
    countries: GameState['countries']
    globalEvents: GameState['globalEvents']
    history: GameState['history']
  }
