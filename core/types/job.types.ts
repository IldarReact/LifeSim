// Job-related types
export type CharacterArchetype = "investor" | "specialist" | "entrepreneur" | "worker" | "indebted";

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
  salary: number; // Monthly salary
  energyCost: number;
  satisfaction: number;
  mentalHealthImpact: number;
  physicalHealthImpact: number;
  imageUrl: string;
  description: string;
  requirements?: string[]; // Skills used in this job
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
