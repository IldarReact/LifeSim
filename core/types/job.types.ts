// Job-related types
import { StatEffect } from "./stats.types";
import { SkillRequirement } from "./skill.types";

export type CharacterArchetype = "investor" | "specialist" | "entrepreneur" | "worker" | "indebted";

export interface JobInfo {
  archetype: CharacterArchetype;
  title: string;
  description: string;
  satisfaction: number;
  cost: StatEffect;
  imageUrl: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  salary: number; // Monthly salary
  cost: StatEffect;
  satisfaction: number;
  imageUrl: string;
  description: string;
  requirements?: SkillRequirement[]; // Skills used in this job
}

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  salary: number;
  cost: StatEffect;
  satisfaction: number;
  requirements: SkillRequirement[];
  daysPending: number;
}
