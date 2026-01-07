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
    food: 0,
    housing: 0,
    transport: 0,
    credits: 0,
    mortgage: 0,
    other: 0,
    family: 0, // Deprecated
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

/**
 * Safely converts a potentially null, undefined, or NaN value to a number.
 */
export function sanitizeNumber(val: number | null | undefined): number {
  if (val === null || val === undefined || isNaN(val)) {
    return 0;
  }
  return val;
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
