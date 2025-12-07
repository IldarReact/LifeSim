// Human traits types
import { StatEffect } from './stats.types';

/**
 * Человеческая черта характера или состояние
 */
export interface HumanTrait {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral' | 'medical';

  // Эффекты на статы персонажа
  effects: StatEffect & {
    // Дополнительные эффекты для бизнеса/работы
    productivity?: number;      // -100 до +100
    socialSkills?: number;      // -100 до +100
    stressResistance?: number;  // -100 до +100
    learningSpeed?: number;     // -100 до +100
  };

  // Влияние на отношения
  relationshipModifier?: number; // -50 до +50

  // Может ли черта быть приобретена/потеряна в игре
  isDynamic: boolean;

  // Редкость черты (влияет на генерацию NPC)
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare';
}
