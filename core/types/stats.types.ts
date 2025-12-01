export type CoreStat =
  | 'money'
  | 'happiness'
  | 'energy'
  | 'health'
  | 'sanity'
  | 'intelligence';

export type Stats = {
  money: number;
  happiness: number;
  energy: number;
  health: number;
  sanity: number;
  intelligence: number;   
};

// Статы персонажа (без денег)
export type PersonalStats = Omit<Stats, 'money'>;

export type StatEffect = Partial<Stats>;
