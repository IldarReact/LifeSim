import { StatEffect } from "./stats.types";

// Skill level is now represented by stars: 0-5
export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface SkillRequirement {
  skillId: string;
  minLevel: SkillLevel;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  maxLevel?: number;
  category?: 'technical' | 'creative' | 'social' | 'physical' | 'language';
}

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
  costPerTurn: StatEffect;
  startedTurn: number;
}

export interface ActiveUniversity {
  id: string;
  programName: string;
  skillName: string;
  skillBonus: number;
  totalDuration: number; // in turns (quarters)
  remainingDuration: number; // in turns
  costPerTurn: StatEffect;
  startedTurn: number;
}
