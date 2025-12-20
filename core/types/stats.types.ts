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



export type StatEffect = Partial<Stats>;
