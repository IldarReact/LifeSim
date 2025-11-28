// Finance-related types (assets and debts)

export type AssetType = 'real_estate' | 'stock' | 'business' | 'deposit';
export type DebtType = 'mortgage' | 'consumer_credit' | 'student_loan';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  purchasePrice: number;
  income: number;
  expenses: number;
  risk: 'low' | 'medium' | 'high';
  liquidity: 'low' | 'medium' | 'high';
  stockSymbol?: string;
  quantity?: number;
}

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  principalAmount: number; // Основная сумма кредита
  remainingAmount: number; // Остаток долга
  interestRate: number; // Процентная ставка (годовая)
  quarterlyPayment: number; // Платеж за квартал
  termQuarters: number; // Срок в кварталах (всегда кратно 1, т.е. 3 месяца)
  remainingQuarters: number; // Осталось кварталов
  startTurn: number; // Когда взят кредит
}

export interface QuarterlyReport {
  income: number;
  taxes: number;
  expenses: number;
  profit: number;
  warning: string | null;
}
