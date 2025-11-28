// Family and personal life types

export interface TimedBuff {
  id: string;
  source: string;
  type: 'happiness' | 'health' | 'energy' | 'sanity' | 'intelligence' | 'income_bonus';
  value: number;
  duration: number; // turns left
  description: string;
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
