// Freelance-related types
import type { SkillLevel } from './skill.types';

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
