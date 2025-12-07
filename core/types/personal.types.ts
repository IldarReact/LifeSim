// Player and personal life state types
import type { Skill, ActiveCourse, ActiveUniversity } from './skill.types';
import type { TimedBuff, FamilyMember, LifeGoal, PotentialPartner, Pregnancy } from './family.types';
import { Stats } from './stats.types';

export interface PersonalLife {
  stats: Stats;
  relations: {
    family: number;
    friends: number;
    colleagues: number;
  };
  skills: Skill[];
  activeCourses: ActiveCourse[];
  activeUniversity: ActiveUniversity[];
  buffs: TimedBuff[];

  // New Family & Goals System
  familyMembers: FamilyMember[];
  lifeGoals: LifeGoal[];

  // Relationship System
  isDating: boolean;
  potentialPartner: PotentialPartner | null;
  pregnancy: Pregnancy | null;
}
