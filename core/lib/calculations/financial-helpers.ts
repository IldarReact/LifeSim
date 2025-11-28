// Helper functions for creating financial report structures
import type { QuarterlyReport, IncomeBreakdown, ExpensesBreakdown, TaxesBreakdown } from '@/core/types';

export function createEmptyIncomeBreakdown(): IncomeBreakdown {
  return {
    salary: 0,
    businessRevenue: 0,
    familyIncome: 0,
    assetIncome: 0,
    capitalGains: 0,
    total: 0
  };
}

export function createEmptyExpensesBreakdown(): ExpensesBreakdown {
  return {
    living: 0,
    family: 0,
    business: 0,
    debtInterest: 0,
    assetMaintenance: 0,
    total: 0
  };
}

export function createEmptyTaxesBreakdown(): TaxesBreakdown {
  return {
    income: 0,
    business: 0,
    capital: 0,
    property: 0,
    total: 0
  };
}

export function createEmptyQuarterlyReport(): QuarterlyReport {
  return {
    income: createEmptyIncomeBreakdown(),
    expenses: createEmptyExpensesBreakdown(),
    taxes: createEmptyTaxesBreakdown(),
    netProfit: 0,
    warning: null
  };
}
