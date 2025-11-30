// Player and personal life state types
import type { Skill, ActiveCourse, ActiveUniversity } from './skill.types';
import type { TimedBuff, FamilyMember, LifeGoal, PotentialPartner, Pregnancy } from './family.types';
import { Stats } from './stats.types';

export interface PersonalLife {
  stats: Omit<Stats, 'money'>;
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
