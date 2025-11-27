export type AssetType = 'real_estate' | 'stock' | 'business' | 'deposit';
export type DebtType = 'mortgage' | 'consumer_credit' | 'student_loan';
export type GameStatus = "setup" | "select_country" | "select_character" | "playing" | "ended";
export type CharacterArchetype = "investor" | "specialist" | "entrepreneur" | "worker" | "indebted";
export type CountryArchetype = "rich_resource" | "rich_stable" | "growing_resource" | "growing_stable" | "poor";

export interface JobInfo {
  archetype: CharacterArchetype;
  title: string;
  description: string;
  satisfaction: number;
  energyCost: number;
  mentalHealthImpact: number;
  physicalHealthImpact: number;
  imageUrl: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  salary: number;
  energyCost: number;
  satisfaction: number;
  mentalHealthImpact: number;
  physicalHealthImpact: number;
  imageUrl: string;
  description: string;
  requirements?: string[]; // Skills used in this job
}

export interface Notification {
  id: string;
  type: 'job_offer' | 'job_rejection' | 'info' | 'promotion' | 'success';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  data?: any;
}

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  salary: number;
  energyCost: number;
  satisfaction: number;
  requirements: string[];
  daysPending: number;
}

export interface FreelanceGig {
  id: string;
  title: string;
  category: string;
  description: string;
  payment: number;
  energyCost: number;
  requirements: Array<{ skill: string; level: SkillLevel }>;
  imageUrl: string;
}

export interface FreelanceApplication {
  id: string;
  gigId: string;
  title: string;
  payment: number;
  energyCost: number;
  requirements: Array<{ skill: string; level: SkillLevel }>;
}

// Employee types for business management
export type EmployeeRole = 
  | 'manager'      // Управляющий - увеличивает общую эффективность
  | 'salesperson'  // Продавец - увеличивает доход
  | 'accountant'   // Бухгалтер - снижает расходы
  | 'marketer'     // Маркетолог - привлекает клиентов
  | 'technician'   // Техник/специалист - повышает качество
  | 'worker';      // Рабочий - базовая работа

export type EmployeeLevel = 'junior' | 'middle' | 'senior' | 'expert';

export interface EmployeeSkills {
  efficiency: number;      // 0-100 - общая эффективность
  salesAbility: number;    // 0-100 - способность продавать
  technical: number;       // 0-100 - технические навыки
  management: number;      // 0-100 - управленческие навыки
  creativity: number;      // 0-100 - креативность
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  level: EmployeeLevel;
  skills: EmployeeSkills;
  salary: number;          // Ежеквартальная зарплата
  satisfaction: number;    // 0-100 - удовлетворенность работой
  productivity: number;    // 0-100 - текущая продуктивность
  experience: number;      // Кварталы работы в компании
  avatar?: string;
}

export type BusinessType = 
  | 'retail'        // Магазин
  | 'service'       // Сервис (автомойка, салон)
  | 'cafe'          // Кафе/ресторан
  | 'tech'          // IT-компания
  | 'manufacturing'; // Производство

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  description: string;
  
  // Финансы
  initialCost: number;      // Стартовый капитал
  quarterlyIncome: number;    // Базовый доход за квартал
  quarterlyExpenses: number;  // Базовые расходы за квартал
  currentValue: number;     // Текущая стоимость бизнеса
  
  // Сотрудники
  employees: Employee[];
  maxEmployees: number;     // Максимум сотрудников
  
  // Характеристики
  reputation: number;       // 0-100 - репутация
  efficiency: number;       // 0-100 - эффективность работы
  customerSatisfaction: number; // 0-100 - удовлетворенность клиентов
  
  // Игровая механика
  energyCostPerTurn: number; // Сколько энергии требует управление
  stressImpact: number;      // Влияние на рассудок
  
  // Метаданные
  foundedTurn: number;       // Когда был открыт
  imageUrl?: string;
}

export interface EmployeeCandidate {
  id: string;
  name: string;
  role: EmployeeRole;
  level: EmployeeLevel;
  skills: EmployeeSkills;
  requestedSalary: number; // За квартал
  experience: number;
  avatar?: string;
  strengths: string[];      // Сильные стороны
  weaknesses: string[];     // Слабые стороны
}


export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  purchasePrice: number;
  income: number;
  expenses: number;
  risk: 'low' | 'medium' | 'high';
  liquidity: 'low' | 'medium' | 'high';
  stockSymbol?: string;
  quantity?: number;
}

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  amount: number;
  interestRate: number;
  quarterlyPayment: number;
  termMonths: number; // Still months or quarters? Let's keep term in quarters for consistency or convert. Let's say termTurns.
}

export interface CountryEconomy {
  id: string;
  name: string;
  archetype: CountryArchetype;
  gdpGrowth: number;
  inflation: number;
  interestRate: number;
  unemployment: number;
  taxRate: number;
  salaryModifier: number;
  costOfLivingModifier: number;
}

export type Country = CountryEconomy;

// Skill level is now represented by stars: 0-5
export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel; // 0-5 stars
  progress: number; // 0-100 progress to next level
  lastPracticedTurn: number; // Turn number when skill was last used/studied
  isBeingStudied?: boolean; // Protected from decay while studying
  isBeingUsedAtWork?: boolean; // Protected from decay and gains XP while working
}

export interface ActiveCourse {
  id: string;
  courseName: string;
  skillName: string;
  skillBonus: number;
  totalDuration: number; // in turns (quarters)
  remainingDuration: number; // in turns
  energyCostPerTurn: number;
  startedTurn: number;
}

export interface ActiveUniversity {
  id: string;
  programName: string;
  skillName: string;
  skillBonus: number;
  totalDuration: number; // in turns (quarters)
  remainingDuration: number; // in turns
  energyCostPerTurn: number;
  startedTurn: number;
}

export interface TimedBuff {
  id: string;
  source: string;
  type: 'happiness' | 'health' | 'energy' | 'sanity' | 'intelligence' | 'income_bonus';
  value: number;
  duration: number; // turns left
  description: string;
}

export interface PersonalLife {
  happiness: number;
  health: number;
  energy: number;
  intelligence: number;
  sanity: number;
  relations: {
    family: number;
    friends: number;
    colleagues: number;
  };
  skills: Skill[];
  activeCourses: ActiveCourse[]; // Courses currently being studied
  activeUniversity: ActiveUniversity[]; // University programs currently enrolled
  buffs: TimedBuff[]; // Temporary buffs/debuffs
  
  // New Family & Goals System
  familyMembers: FamilyMember[];
  lifeGoals: LifeGoal[];
  
  // Relationship System
  isDating: boolean;
  potentialPartner: PotentialPartner | null;
  pregnancy: Pregnancy | null;
}

export interface StatModifier {
  source: string; // "Работа: Frontend Developer", "Семья: Виктория", "Курс: React"
  happiness?: number;
  health?: number;
  energy?: number;
  sanity?: number;
  intelligence?: number;
}

export interface StatModifiers {
  happiness: StatModifier[];
  health: StatModifier[];
  energy: StatModifier[];
  sanity: StatModifier[];
  intelligence: StatModifier[];
}

export interface PotentialPartner {
  id: string;
  name: string;
  age: number;
  occupation: string;
  income: number; // Quarterly
  avatar?: string;
}

export interface Pregnancy {
  turnsLeft: number; // 3 turns (9 months)
  isTwins: boolean;
  motherId: string; // ID of the mother (wife or player if female)
}

export interface FamilyMember {
  id: string;
  name: string;
  type: 'wife' | 'husband' | 'child' | 'pet' | 'parent';
  age: number;
  relationLevel: number; // 0-100
  income: number; // Quarterly income contribution
  expenses: number; // Quarterly expenses
  happinessMod: number; // Passive happiness per turn
  sanityMod: number; // Passive sanity per turn
  healthMod: number; // Passive health per turn
  avatar?: string;
  goals?: LifeGoal[]; // Personal goals of the family member
}

export interface LifeGoal {
  id: string;
  title: string;
  description: string;
  type: 'dream' | 'goal';
  progress: number;
  target: number;
  reward: {
    happinessPerTurn: number;
    sanityPerTurn: number;
    durationTurns: number; // How long the reward lasts
  };
  isCompleted: boolean;
  requirements?: {
    cash?: number;
    salary?: number;
    jobTitle?: string;
    skillLevel?: { skill: string; level: number };
    hasCar?: boolean;
    hasHouse?: boolean;
    hasFamily?: boolean;
  };
}

export interface QuarterlyReport {
  income: number;
  taxes: number;
  expenses: number;
  profit: number;
  warning: string | null;
}

export interface HistoryEntry {
  turn: number;
  year: number;
  netWorth: number;
  happiness: number;
  health: number;
  eventDescription?: string;
}

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  impact: {
    gdp?: number;
    inflation?: number;
    market?: number;
  };
}

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
