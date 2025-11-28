// Player and personal life state types
import type { Skill, ActiveCourse, ActiveUniversity } from './skill.types';
import type { TimedBuff, FamilyMember, LifeGoal, PotentialPartner, Pregnancy } from './family.types';

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
