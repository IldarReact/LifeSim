// Family and personal life types

import { CoreStat, StatEffect } from "./stats.types";

export interface TimedBuff {
  id: string;
  source: string;
  effects: StatEffect;
  duration: number;
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
  passiveEffects: StatEffect; // Passive effects per turn
  avatar?: string;
  goals?: LifeGoal[]; // Personal goals of the family member
  employedInBusinessId?: string; // ID бизнеса, где работает
  occupation?: string; // Название работы (если работает не в бизнесе игрока)
  jobId?: string; // ID работы из jobs.json для отображения деталей

  // Lifestyle preferences (references to shop items)
  foodPreference?: string; // ID товара из категории 'food'
  transportPreference?: string; // ID товара из категории 'transport'

  // Traits
  traits?: string[]; // IDs from human-traits.json

  // Detailed expenses
  expensesBreakdown?: {
    food: number;
    housing: number;
    transport: number;
    credits: number;
    mortgage: number;
    other: number;
    total: number;
  };
}

export interface LifeGoal {
  id: string;
  title: string;
  description: string;
  type: 'dream' | 'goal';
  progress: number;
  target: number;
  reward: {
    perTurnReward: StatEffect;
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
  money?: number;
  source: string;
  happiness?: number;
  health?: number;
  energy?: number;
  sanity?: number;
  intelligence?: number;
}

export interface StatModifiers {
  money: StatModifier[];
  happiness: StatModifier[];
  health: StatModifier[];
  energy: StatModifier[];
  sanity: StatModifier[];
  intelligence: StatModifier[];
}

