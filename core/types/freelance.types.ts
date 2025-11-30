// Freelance-related types
import type { SkillRequirement } from './skill.types';
import type { StatEffect } from './stats.types';

export interface FreelanceGig {
  id: string;
  title: string;
  category: string;
  description: string;
  payment: number;
  cost: StatEffect;
  requirements: SkillRequirement[];
  imageUrl: string;
}

export interface FreelanceApplication {
  id: string;
  gigId: string;
  title: string;
  payment: number;
  cost: StatEffect;
  requirements: SkillRequirement[];
}
