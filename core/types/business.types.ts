// Business-related types

export type EmployeeRole =
  | 'manager'      // Управляющий - увеличивает общую эффективность
  | 'salesperson'  // Продавец - увеличивает доход
  | 'accountant'   // Бухгалтер - снижает расходы
  | 'marketer'     // Маркетолог - привлекает клиентов
  | 'technician'   // Техник/специалист - повышает качество
  | 'worker';      // Рабочий - базовая работа

export type EmployeeLevel = 'junior' | 'middle' | 'senior' | 'expert';

export interface EmployeeSkills {
  efficiency: number;      // 0-100 - общая эффективность
  salesAbility: number;    // 0-100 - способность продавать
  technical: number;       // 0-100 - технические навыки
  management: number;      // 0-100 - управленческие навыки
  creativity: number;      // 0-100 - креативность
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  level: EmployeeLevel;
  skills: EmployeeSkills;
  salary: number;          // Ежеквартальная зарплата
  satisfaction: number;    // 0-100 - удовлетворенность работой
  productivity: number;    // 0-100 - текущая продуктивность
  experience: number;      // Кварталы работы в компании
  avatar?: string;
}

export type BusinessType =
  | 'retail'        // Магазин
  | 'service'       // Сервис (автомойка, салон)
  | 'cafe'          // Кафе/ресторан
  | 'tech'          // IT-компания
  | 'manufacturing'; // Производство

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  description: string;

  // Финансы
  initialCost: number;      // Стартовый капитал
  quarterlyIncome: number;    // Базовый доход за квартал
  quarterlyExpenses: number;  // Базовые расходы за квартал
  currentValue: number;     // Текущая стоимость бизнеса

  // Сотрудники
  employees: Employee[];
  maxEmployees: number;     // Максимум сотрудников

  // Характеристики
  reputation: number;       // 0-100 - репутация
  efficiency: number;       // 0-100 - эффективность работы
  customerSatisfaction: number; // 0-100 - удовлетворенность клиентов

  // Игровая механика
  energyCostPerTurn: number; // Сколько энергии требует управление
  stressImpact: number;      // Влияние на рассудок

  // Метаданные
  foundedTurn: number;       // Когда был открыт
  imageUrl?: string;
}

export interface EmployeeCandidate {
  id: string;
  name: string;
  role: EmployeeRole;
  level: EmployeeLevel;
  skills: EmployeeSkills;
  requestedSalary: number; // За квартал
  experience: number;
  avatar?: string;
  strengths: string[];      // Сильные стороны
  weaknesses: string[];     // Слабые стороны
}
