// Finance-related types (assets and debts)

export type AssetType = 'housing' | 'stock' | 'business' | 'deposit';
export type DebtType = 'mortgage' | 'consumer_credit' | 'student_loan';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;              // Deprecated: use currentValue instead
  currentValue: number;       // Текущая стоимость
  purchasePrice: number;      // Цена покупки
  unrealizedGain: number;     // Нереализованная прибыль (currentValue - purchasePrice)
  income: number;             // Доход за месяц (дивиденды, рента)
  expenses: number;           // Расходы за месяц (обслуживание)
  risk: 'low' | 'medium' | 'high';
  liquidity: 'low' | 'medium' | 'high';
  stockSymbol?: string;
  quantity?: number;
  lastSoldPrice?: number;     // Цена последней продажи (если продавался)
  soldAt?: number;            // Квартал продажи
}

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  principalAmount: number;      // Основная сумма кредита
  remainingAmount: number;      // Остаток долга
  interestRate: number;         // Процентная ставка (годовая)
  quarterlyPayment: number;     // Общий платеж за квартал
  quarterlyPrincipal: number;   // Основной долг в платеже за квартал
  quarterlyInterest: number;    // Проценты в платеже за квартал
  termQuarters: number;         // Срок в кварталах (всегда кратно 1, т.е. 3 месяца)
  remainingQuarters: number;    // Осталось кварталов
  startTurn: number;            // Когда взят кредит
}

export interface IncomeBreakdown {
  salary: number;           // Зарплата
  businessRevenue: number;  // Доход от бизнеса
  familyIncome: number;     // Доход от семьи
  assetIncome: number;      // Доход от активов (дивиденды, рента)
  capitalGains: number;     // Прибыль от продажи активов
  total: number;            // Общий доход
}

export interface ExpensesBreakdown {
  living: number;           // Общие расходы на жизнь (сумма категорий ниже)
  food: number;             // Еда
  housing: number;          // Жилье
  transport: number;        // Транспорт
  credits: number;          // Потребительские кредиты
  mortgage: number;         // Ипотека
  other: number;            // Другое (включая личные траты семьи)

  family: number;           // Deprecated: теперь распределено по категориям
  business: number;         // Расходы бизнеса
  debtInterest: number;     // Общие проценты (сумма credits + mortgage)
  assetMaintenance: number; // Обслуживание активов
  total: number;            // Общие расходы
}

export interface TaxesBreakdown {
  income: number;           // Налог на доход (для наемных)
  business: number;         // Налог на прибыль бизнеса
  capital: number;          // Налог на прирост капитала
  property: number;         // Налог на имущество
  total: number;            // Общие налоги
}

export interface QuarterlyReport {
  income: IncomeBreakdown;
  expenses: ExpensesBreakdown;
  taxes: TaxesBreakdown;
  netProfit: number;        // Чистая прибыль
  warning: string | null;   // Предупреждение
}
