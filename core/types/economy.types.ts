// Economy-related types

export type CountryArchetype = "rich_resource" | "rich_stable" | "growing_resource" | "growing_stable" | "poor";

export type EconomicEventType =
  | 'crisis' // Кризис
  | 'boom' // Экономический рост
  | 'recession' // Рецессия
  | 'inflation_spike' // Скачок инфляции
  | 'rate_hike' // Повышение ставки
  | 'rate_cut'; // Снижение ставки

export interface EconomicEvent {
  id: string;
  type: EconomicEventType;
  title: string;
  description: string;
  turn: number; // Когда произошло
  duration: number; // Длительность в кварталах
  effects: {
    inflationChange?: number; // Изменение инфляции (%)
    keyRateChange?: number; // Изменение ключевой ставки (%)
    gdpGrowthChange?: number; // Изменение роста ВВП (%)
    unemploymentChange?: number; // Изменение безработицы (%)
    salaryModifierChange?: number; // Изменение зарплат (множитель)
  };
}

export type EconomicPhase = 'growth' | 'peak' | 'recession' | 'recovery'

export interface EconomicCycle {
  phase: EconomicPhase
  durationLeft: number // Quarters left in current phase
  intensity: number // 0.0 to 1.0 (how strong is the effect)
  marketModifier: number // Multiplier for demand (e.g., 1.2 for growth, 0.7 for recession)
}

export interface CountryEconomy {
  id: string;
  name: string;
  archetype: CountryArchetype;
  gdpGrowth: number; // Рост ВВП (%)
  inflation: number; // Инфляция (% годовых)
  stockMarketInflation: number; // Инфляция фондового рынка (% годовых)
  keyRate: number; // Ключевая ставка ЦБ (% годовых)
  interestRate: number; // Базовая процентная ставка (deprecated, используем keyRate)
  unemployment: number; // Безработица (%)
  taxRate: number; // Личный налог на доход (зарплата, дивиденды) (%)
  corporateTaxRate: number; // Налог на прибыль бизнеса (%)
  salaryModifier: number; // Модификатор зарплат
  costOfLivingModifier: number; // Модификатор стоимости жизни
  baseSalaries?: Record<string, number>; // Базовые зарплаты по ролям
  imageUrl?: string; // URL изображения страны
  activeEvents: EconomicEvent[]; // Активные экономические события
  inflationHistory?: number[]; // История годовой инфляции для накопленного расчета
  baseYear?: number; // Базовый год для расчета инфляции (обычно год начала игры)
  cycle?: EconomicCycle; // Текущий экономический цикл
}

export type Country = CountryEconomy;

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  impact: {
    gdp?: number;
    inflation?: number;
    market?: number;
  };
}
