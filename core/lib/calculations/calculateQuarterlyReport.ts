// Calculate quarterly financial report based on player type
import type { PlayerState, QuarterlyReport, IncomeBreakdown, ExpensesBreakdown, TaxesBreakdown } from '@/core/types';
import type { CountryEconomy } from '@/core/types/economy.types';
import { calculateBusinessFinancials } from '@/core/lib/business-utils';

/**
 * Determines the player's primary activity type
 */
export function determinePlayerType(player: PlayerState): 'employee' | 'business_owner' | 'mixed' {
  const hasJob = player.quarterlySalary > 0 || player.jobs.length > 0;
  const hasBusiness = player.businesses.length > 0;

  if (hasJob && hasBusiness) return 'mixed';
  if (hasBusiness) return 'business_owner';
  return 'employee';
}

/**
 * Calculates quarterly report for an employee
 * Formula: (Income - Taxes) - Expenses = Net Profit
 */
export function calculateEmployeeQuarterlyReport(params: {
  player: PlayerState;
  country: CountryEconomy;
  familyIncome: number;
  familyExpenses: number;
  assetIncome: number;
  assetMaintenance: number;
  debtInterest: number;
  buffIncomeMod: number;
}): QuarterlyReport {
  const { player, country, familyIncome, familyExpenses, assetIncome, assetMaintenance, debtInterest, buffIncomeMod } = params;

  // Income
  const salary = player.quarterlySalary * (1 + buffIncomeMod / 100);
  const totalIncome = salary + familyIncome + assetIncome;

  const income: IncomeBreakdown = {
    salary,
    businessRevenue: 0,
    familyIncome,
    assetIncome,
    capitalGains: 0,
    total: totalIncome
  };

  // Taxes (for employees: calculated on gross income BEFORE expenses)
  const incomeTax = totalIncome * (country.taxRate / 100);
  const propertyTax = player.assets
    .filter(a => a.type === 'real_estate')
    .reduce((sum, a) => sum + (a.currentValue * 0.00125), 0); // 0.5% yearly = 0.125% quarterly

  const taxes: TaxesBreakdown = {
    income: Math.round(incomeTax),
    business: 0,
    capital: 0,
    property: Math.round(propertyTax),
    total: Math.round(incomeTax + propertyTax)
  };

  // Net income after taxes
  const netIncome = totalIncome - taxes.total;

  // Expenses
  const baseLiving = 1000 * 3 * country.costOfLivingModifier; // Base cost of living for 3 months

  const expenses: ExpensesBreakdown = {
    living: Math.round(baseLiving),
    family: Math.round(familyExpenses),
    business: 0,
    debtInterest: Math.round(debtInterest),
    assetMaintenance: Math.round(assetMaintenance),
    total: Math.round(baseLiving + familyExpenses + debtInterest + assetMaintenance)
  };

  // Net profit
  const netProfit = netIncome - expenses.total;

  return {
    income,
    expenses,
    taxes,
    netProfit: Math.round(netProfit),
    warning: netProfit < 0 ? "Вы теряете деньги!" : null
  };
}

/**
 * Calculates quarterly report for a business owner
 * Formula: (Revenue - Business Expenses) - Taxes = Net Profit
 */
export function calculateBusinessOwnerQuarterlyReport(params: {
  player: PlayerState;
  country: CountryEconomy;
  familyIncome: number;
  familyExpenses: number;
  assetIncome: number;
  assetMaintenance: number;
  debtInterest: number;
  buffIncomeMod: number;
}): QuarterlyReport {
  const { player, country, familyIncome, familyExpenses, assetIncome, assetMaintenance, debtInterest, buffIncomeMod } = params;

  // Calculate business financials
  const businessFinancials = player.businesses.reduce((acc, b) => {
    const financials = calculateBusinessFinancials(b);
    return {
      revenue: acc.revenue + financials.income,
      expenses: acc.expenses + financials.expenses
    };
  }, { revenue: 0, expenses: 0 });

  // Income
  const businessRevenue = businessFinancials.revenue * (1 + buffIncomeMod / 100);
  const totalIncome = businessRevenue + familyIncome + assetIncome;

  const income: IncomeBreakdown = {
    salary: 0,
    businessRevenue,
    familyIncome,
    assetIncome,
    capitalGains: 0,
    total: totalIncome
  };

  // Expenses (for business: expenses BEFORE taxes)
  const baseLiving = 1000 * 3 * country.costOfLivingModifier;

  const expenses: ExpensesBreakdown = {
    living: Math.round(baseLiving),
    family: Math.round(familyExpenses),
    business: Math.round(businessFinancials.expenses),
    debtInterest: Math.round(debtInterest),
    assetMaintenance: Math.round(assetMaintenance),
    total: Math.round(baseLiving + familyExpenses + businessFinancials.expenses + debtInterest + assetMaintenance)
  };

  // Profit before tax
  const profitBeforeTax = totalIncome - expenses.total;

  // Taxes (for business: calculated on profit AFTER expenses)
  const businessTax = Math.max(0, profitBeforeTax * (country.taxRate / 100));
  const propertyTax = player.assets
    .filter(a => a.type === 'real_estate')
    .reduce((sum, a) => sum + (a.currentValue * 0.00125), 0);

  const taxes: TaxesBreakdown = {
    income: 0,
    business: Math.round(businessTax),
    capital: 0,
    property: Math.round(propertyTax),
    total: Math.round(businessTax + propertyTax)
  };

  // Net profit
  const netProfit = profitBeforeTax - taxes.total;

  return {
    income,
    expenses,
    taxes,
    netProfit: Math.round(netProfit),
    warning: netProfit < 0 ? "Вы теряете деньги!" : null
  };
}

/**
 * Calculates quarterly report for mixed activity (both employee and business owner)
 * Uses a hybrid approach
 */
export function calculateMixedQuarterlyReport(params: {
  player: PlayerState;
  country: CountryEconomy;
  familyIncome: number;
  familyExpenses: number;
  assetIncome: number;
  assetMaintenance: number;
  debtInterest: number;
  buffIncomeMod: number;
}): QuarterlyReport {
  const { player, country, familyIncome, familyExpenses, assetIncome, assetMaintenance, debtInterest, buffIncomeMod } = params;

  // Calculate business financials
  const businessFinancials = player.businesses.reduce((acc, b) => {
    const financials = calculateBusinessFinancials(b);
    return {
      revenue: acc.revenue + financials.income,
      expenses: acc.expenses + financials.expenses
    };
  }, { revenue: 0, expenses: 0 });

  // Income
  const salary = player.quarterlySalary * (1 + buffIncomeMod / 100);
  const businessRevenue = businessFinancials.revenue * (1 + buffIncomeMod / 100);
  const totalIncome = salary + businessRevenue + familyIncome + assetIncome;

  const income: IncomeBreakdown = {
    salary,
    businessRevenue,
    familyIncome,
    assetIncome,
    capitalGains: 0,
    total: totalIncome
  };

  // Expenses
  const baseLiving = 1000 * 3 * country.costOfLivingModifier;

  const expenses: ExpensesBreakdown = {
    living: Math.round(baseLiving),
    family: Math.round(familyExpenses),
    business: Math.round(businessFinancials.expenses),
    debtInterest: Math.round(debtInterest),
    assetMaintenance: Math.round(assetMaintenance),
    total: Math.round(baseLiving + familyExpenses + businessFinancials.expenses + debtInterest + assetMaintenance)
  };

  // For mixed: tax salary as employee, business profit as business
  const salaryTax = salary * (country.taxRate / 100);
  const businessProfit = businessRevenue - businessFinancials.expenses;
  const businessTax = Math.max(0, businessProfit * (country.taxRate / 100));
  const propertyTax = player.assets
    .filter(a => a.type === 'real_estate')
    .reduce((sum, a) => sum + (a.currentValue * 0.00125), 0);

  const taxes: TaxesBreakdown = {
    income: Math.round(salaryTax),
    business: Math.round(businessTax),
    capital: 0,
    property: Math.round(propertyTax),
    total: Math.round(salaryTax + businessTax + propertyTax)
  };

  // Net profit
  const netProfit = totalIncome - expenses.total - taxes.total;

  return {
    income,
    expenses,
    taxes,
    netProfit: Math.round(netProfit),
    warning: netProfit < 0 ? "Вы теряете деньги!" : null
  };
}

/**
 * Main function to calculate quarterly report based on player type
 */
export function calculateQuarterlyReport(params: {
  player: PlayerState;
  country: CountryEconomy;
  familyIncome: number;
  familyExpenses: number;
  assetIncome: number;
  assetMaintenance: number;
  debtInterest: number;
  buffIncomeMod: number;
}): QuarterlyReport {
  const playerType = determinePlayerType(params.player);

  switch (playerType) {
    case 'employee':
      return calculateEmployeeQuarterlyReport(params);
    case 'business_owner':
      return calculateBusinessOwnerQuarterlyReport(params);
    case 'mixed':
      return calculateMixedQuarterlyReport(params);
  }
}
